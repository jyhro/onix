// Crea una nota con nombre libre ("Sin título", "Sin título 1", …) en el
// workspace y devuelve su id. No pisa nada: el nombre se elige contra la
// lista real del servidor. Lanza con el status HTTP si falla (403 sin grant).
export async function createUntitledNote(wsId: string): Promise<string> {
  const base = `/api/w/${encodeURIComponent(wsId)}/notes`;
  const res = await fetch(base);
  if (!res.ok) throw new Error(`GET notes ${res.status}`);
  const data = (await res.json()) as { notes: string[] };
  const taken = new Set(data.notes);
  let name = "Sin título";
  for (let i = 1; taken.has(name); i += 1) name = `Sin título ${i}`;
  const put = await fetch(base, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: name, content: "" }),
  });
  if (!put.ok) throw new Error(`POST note ${put.status}`);
  return name;
}

export function noteUrl(wsId: string, noteId: string): string {
  return `/w/${encodeURIComponent(wsId)}/n/${noteId
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/")}`;
}
