import path from "node:path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { can, type Perm } from "@/lib/system-store";

export function workspaceRoot(ws: string): string {
  const clean = (ws ?? "").trim();
  if (!clean || clean === "." || clean === ".." || clean.includes("/") || clean.includes("\\")) {
    throw Object.assign(new Error(`workspace inválido: ${ws}`), { status: 400 });
  }
  return path.join(process.env.VAULT_ROOT ?? "./vault", "workspaces", clean);
}

// Body JSON inválido → 400 (no 500).
export async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw Object.assign(new Error("body JSON inválido"), { status: 400 });
  }
}

// Task 6: rutas cerradas. Sin sesión → 401; sin grant → 403 (GET/HEAD: read, resto: write lo decide cada ruta).
export async function requireGrant(req: Request, ws: string, perm: Perm): Promise<string> {
  const s = await getSession(req);
  if (!s) throw Object.assign(new Error("no autorizado"), { status: 401 });
  if (!can(s.userId, ws, perm)) throw Object.assign(new Error("sin permiso"), { status: 403 });
  return s.userId;
}

// Mapea errores de vault y de auth (Task 6: 401 sin sesión, 403 sin grant).
export function errRes(e: unknown): NextResponse {
  const msg = e instanceof Error ? e.message : "error";
  const status = (e as { status?: number })?.status;
  if (status === 400 || status === 401 || status === 403 || status === 404 || status === 413)
    return NextResponse.json({ error: msg }, { status });
  if (msg.includes("fuera del vault") || msg.includes("vacío") || msg.includes("inválido"))
    return NextResponse.json({ error: msg }, { status: 400 });
  if (msg.includes("1 MB")) return NextResponse.json({ error: msg }, { status: 413 });
  if ((e as NodeJS.ErrnoException)?.code === "ENOENT")
    return NextResponse.json({ error: "no existe" }, { status: 404 });
  return NextResponse.json({ error: msg }, { status: 500 });
}
