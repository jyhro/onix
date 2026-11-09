import { listNotes, readNote } from "./vault";

export interface SearchHit {
  id: string;
  snippet: string;
}

export async function searchNotes(root: string, q: string): Promise<SearchHit[]> {
  const needle = (q ?? "").toLowerCase();
  if (!needle) return [];
  const hits: SearchHit[] = [];
  for (const id of await listNotes(root)) {
    const { content } = await readNote(root, id);
    const line =
      content.split("\n").find((l) => l.toLowerCase().includes(needle)) ??
      (id.toLowerCase().includes(needle) ? id : undefined);
    if (line !== undefined) hits.push({ id, snippet: line.trim().slice(0, 160) });
  }
  return hits;
}
