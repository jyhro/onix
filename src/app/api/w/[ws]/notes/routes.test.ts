import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { strict as assert } from "node:assert";
import { afterEach, beforeEach, describe, it } from "vitest";
import { writeNote } from "@/lib/vault";
import { signSession } from "@/lib/session";
import { createUser } from "@/lib/system-store";
import { GET as getOne, PUT as putOne } from "./[...id]/route";
import { POST as postNotes } from "./route";

process.env.SESSION_SECRET ??= "test-secret-con-32-caracteres-minimo";

const WS = "t4";
let prevVault: string | undefined;
let prevData: string | undefined;
let cookie = "";

function params(): { params: Promise<{ ws: string }> };
function params(id: string[]): { params: Promise<{ ws: string; id: string[] }> };
function params(id?: string[]) {
  return id === undefined
    ? { params: Promise.resolve({ ws: WS }) }
    : { params: Promise.resolve({ ws: WS, id }) };
}

function reqWithBody(method: string, body: string): Request {
  return new Request("http://x/api", {
    method,
    headers: { "Content-Type": "application/json", cookie },
    body,
  });
}

function getReq(): Request {
  return new Request("http://x/api", { headers: { cookie } });
}

beforeEach(async () => {
  prevVault = process.env.VAULT_ROOT;
  prevData = process.env.DATA_ROOT;
  process.env.VAULT_ROOT = await mkdtemp(join(tmpdir(), "onix-api-"));
  process.env.DATA_ROOT = await mkdtemp(join(tmpdir(), "onix-api-sys-"));
  // Las rutas exigen sesión (Task 6): owner bypassa los grants.
  const owner = await createUser({ name: "owner", password: "x", role: "owner" });
  cookie = `onix_session=${await signSession(owner.id)}`;
});

afterEach(() => {
  if (prevVault === undefined) delete process.env.VAULT_ROOT;
  else process.env.VAULT_ROOT = prevVault;
  if (prevData === undefined) delete process.env.DATA_ROOT;
  else process.env.DATA_ROOT = prevData;
});

describe("rutas de notas", () => {
  it("resuelve ids anidados (dir/b) → 200", async () => {
    const root = join(process.env.VAULT_ROOT!, "workspaces", WS);
    await writeNote(root, "dir/b", "# B");
    const res = await getOne(getReq(), params(["dir", "b"]));
    assert.equal(res.status, 200);
    assert.equal((await res.json()).id, "dir/b");
  });

  it(".. anidado → 400", async () => {
    const res = await getOne(getReq(), params(["..", "x"]));
    assert.equal(res.status, 400);
  });

  it("POST con body no-JSON → 400", async () => {
    const res = await postNotes(reqWithBody("POST", "esto no es json"), params());
    assert.equal(res.status, 400);
  });

  it("POST con id numérico → 400 (no 500)", async () => {
    const res = await postNotes(reqWithBody("POST", '{"id":42,"content":"x"}'), params());
    assert.equal(res.status, 400);
  });

  it("POST sin id → 400", async () => {
    const res = await postNotes(reqWithBody("POST", '{"content":"x"}'), params());
    assert.equal(res.status, 400);
  });

  it("PUT con body no-JSON → 400", async () => {
    const res = await putOne(reqWithBody("PUT", "{mal"), params(["a"]));
    assert.equal(res.status, 400);
  });

  it("sin sesión → 401", async () => {
    const res = await getOne(new Request("http://x/api"), params(["a"]));
    assert.equal(res.status, 401);
  });

  it("sin grant → 403", async () => {
    const u = await createUser({ name: "u", password: "y", role: "user" });
    const authed = new Request("http://x/api", {
      headers: { cookie: `onix_session=${await signSession(u.id)}` },
    });
    const res = await getOne(authed, params(["a"]));
    assert.equal(res.status, 403);
  });
});
