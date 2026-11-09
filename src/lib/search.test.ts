import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { strict as assert } from "node:assert";
import { describe, it } from "vitest";
import { writeNote } from "./vault";
import { searchNotes } from "./search";

describe("search", () => {
  it("encuentra por título y contenido (case-insensitive)", async () => {
    const root = await mkdtemp(join(tmpdir(), "onix-search-"));
    await writeNote(root, "receta", "# Tarta\nazúcar y harina");
    assert((await searchNotes(root, "azúcar"))[0].id === "receta");
    assert((await searchNotes(root, "receta"))[0].id === "receta");
  });
});
