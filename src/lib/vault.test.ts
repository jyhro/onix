import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { strict as assert } from "node:assert";
import { describe, it } from "vitest";
import { deleteNote, listNotes, readNote, writeNote } from "./vault";

async function mkroot(): Promise<string> {
  return await mkdtemp(join(tmpdir(), "onix-vault-"));
}

async function assertRejects(p: Promise<unknown>): Promise<void> {
  await assert.rejects(p);
}

describe("vault", () => {
  it("CRUD confinado", async () => {
    const root = await mkroot();
    await writeNote(root, "hola", "# Hola");
    assert((await readNote(root, "hola")).content.includes("Hola"));
    await assertRejects(writeNote(root, "../fuera", "x"));
    await assertRejects(writeNote(root, "gorda", "x".repeat(1024 * 1024 + 1)));
    await assertRejects(writeNote(root, "   ", "x"));
    await assertRejects(writeNote(root, "/abs", "x"));
    await assertRejects(readNote(root, "../hola"));
    assert((await listNotes(root)).includes("hola"));
    await deleteNote(root, "hola");
    assert(!(await listNotes(root)).includes("hola"));
  });
});
