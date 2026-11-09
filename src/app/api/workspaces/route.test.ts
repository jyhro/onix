import { strict as assert } from "node:assert";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, it } from "vitest";
import { signSession } from "@/lib/session";
import { createUser, createWorkspace, grant } from "@/lib/system-store";
import { GET } from "./route";

process.env.SESSION_SECRET ??= "test-secret-con-32-caracteres-minimo";

let prevData: string | undefined;

async function signedReq(userId: string): Promise<Request> {
  return new Request("http://x/api/workspaces", {
    headers: { cookie: `onix_session=${await signSession(userId)}` },
  });
}

beforeEach(async () => {
  prevData = process.env.DATA_ROOT;
  process.env.DATA_ROOT = await mkdtemp(join(tmpdir(), "onix-api-ws-"));
});

afterEach(() => {
  if (prevData === undefined) delete process.env.DATA_ROOT;
  else process.env.DATA_ROOT = prevData;
});

describe("GET /api/workspaces", () => {
  it("sin sesión → 401", async () => {
    assert.equal(
      (await GET(new Request("http://x/api/workspaces"))).status,
      401,
    );
  });

  it("owner ve todos; user con grant solo el suyo; sin grant → vacía; sin hashes", async () => {
    const owner = await createUser({
      name: "owner",
      password: "x",
      role: "owner",
    });
    const u1 = await createUser({ name: "u1", password: "y", role: "user" });
    const u2 = await createUser({ name: "u2", password: "z", role: "user" });
    const a = await createWorkspace("a");
    const b = await createWorkspace("b");
    await grant(u1.id, a.id, ["read"]);

    const asOwner = await (await GET(await signedReq(owner.id))).json();
    assert.deepEqual(
      asOwner.workspaces.map((w: { id: string }) => w.id).sort(),
      [a.id, b.id].sort(),
    );

    const asU1 = await (await GET(await signedReq(u1.id))).json();
    assert.deepEqual(
      asU1.workspaces.map((w: { id: string }) => w.id),
      [a.id],
    );
    assert.deepEqual(asU1.workspaces[0].perms, ["read"]);

    const asU2 = await (await GET(await signedReq(u2.id))).json();
    assert.deepEqual(asU2.workspaces, []);

    for (const body of [asOwner, asU1, asU2]) {
      assert.ok(!JSON.stringify(body).includes("passwordHash"));
      assert.ok(!JSON.stringify(body).includes("hash"));
    }
  });

  it("ungranted: GET notas del ws ajeno → 403", async () => {
    const { GET: getNotes } = await import("@/app/api/w/[ws]/notes/route");
    await createUser({ name: "owner", password: "x", role: "owner" });
    const other = await createUser({
      name: "other",
      password: "y",
      role: "user",
    });
    const ws = await createWorkspace("priv");
    const res = await getNotes(await signedReq(other.id), {
      params: Promise.resolve({ ws: ws.id }),
    });
    assert.equal(res.status, 403);
  });
});
