import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { strict as assert } from "node:assert";
import { beforeEach, describe, it } from "vitest";
import { can, createUser, createWorkspace, grant, verifyUser } from "./system-store";

beforeEach(async () => {
  process.env.DATA_ROOT = await mkdtemp(join(tmpdir(), "onix-system-"));
});

describe("system-store", () => {
  it("usuarios, workspaces y grants", async () => {
    const a = await createUser({ name: "admin", password: "x", role: "owner" });
    assert((await verifyUser("admin", "x"))?.id === a.id);
    assert((await verifyUser("admin", "mal")) === null);
    const w = await createWorkspace(" Casa ");
    assert(can(a.id, w.id, "write") === true); // owner todo
    const u = await createUser({ name: "u", password: "y", role: "user" });
    assert(can(u.id, w.id, "read") === false);
    await grant(u.id, w.id, "read");
    assert(can(u.id, w.id, "read") === true);
  });
});
