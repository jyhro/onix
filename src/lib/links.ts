export function parseLinks(md: string): string[] {
  const out: string[] = [];
  const re = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) out.push(m[1]);
  return out;
}

export function resolveLink(
  name: string,
  ids: string[],
): { target: string; exists: boolean } {
  return { target: name, exists: ids.includes(name) };
}
