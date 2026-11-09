import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export const MAX_NOTE_BYTES = 1024 * 1024;

export interface VaultNote {
  id: string;
  content: string;
  data: Record<string, unknown>;
}

function fail(message: string, status: number): never {
  throw Object.assign(new Error(message), { status });
}

function resolveId(root: string, id: string): { abs: string; id: string } {
  const clean = (id ?? "").trim();
  if (!clean) fail("id vacío", 400);
  if (path.isAbsolute(clean) || clean.includes("\\") || clean.includes("\0")) {
    fail(`id fuera del vault: ${id}`, 400);
  }
  const segments = clean.split("/");
  if (segments.some((s) => s === "" || s === "." || s === "..")) {
    fail(`id fuera del vault: ${id}`, 400);
  }
  const rootAbs = path.resolve(root);
  const abs = path.resolve(rootAbs, ...segments) + ".md";
  if (abs !== rootAbs && !abs.startsWith(rootAbs + path.sep)) {
    fail(`id fuera del vault: ${id}`, 400);
  }
  return { abs, id: segments.join("/") };
}

export async function listNotes(root: string): Promise<string[]> {
  const rootAbs = path.resolve(root);
  const out: string[] = [];
  async function walk(dir: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch (e: unknown) {
      if ((e as NodeJS.ErrnoException)?.code === "ENOENT" && dir === rootAbs) return;
      throw e;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (e.isFile() && e.name.endsWith(".md")) {
        out.push(path.relative(rootAbs, full).slice(0, -3).split(path.sep).join("/"));
      }
    }
  }
  await walk(rootAbs);
  return out.sort();
}

export async function readNote(root: string, id: string): Promise<VaultNote> {
  const { abs, id: clean } = resolveId(root, id);
  const content = await readFile(abs, "utf8");
  const { data } = matter(content);
  return { id: clean, content, data: data as Record<string, unknown> };
}

export async function writeNote(root: string, id: string, content: string): Promise<void> {
  if (typeof content !== "string") fail("contenido inválido", 400);
  if (Buffer.byteLength(content, "utf8") > MAX_NOTE_BYTES) {
    fail("nota mayor de 1 MB", 413);
  }
  const { abs } = resolveId(root, id);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, content, "utf8");
}

export async function deleteNote(root: string, id: string): Promise<void> {
  const { abs } = resolveId(root, id);
  await unlink(abs);
}
