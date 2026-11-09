import path from "node:path";
import { NextResponse } from "next/server";

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

// Sin auth hasta Task 6 (rutas abiertas): solo mapea errores de vault.
export function errRes(e: unknown): NextResponse {
  const msg = e instanceof Error ? e.message : "error";
  if ((e as { status?: number })?.status === 400) return NextResponse.json({ error: msg }, { status: 400 });
  if (msg.includes("fuera del vault") || msg.includes("vacío") || msg.includes("inválido"))
    return NextResponse.json({ error: msg }, { status: 400 });
  if (msg.includes("1 MB")) return NextResponse.json({ error: msg }, { status: 413 });
  if ((e as NodeJS.ErrnoException)?.code === "ENOENT")
    return NextResponse.json({ error: "no existe" }, { status: 404 });
  return NextResponse.json({ error: msg }, { status: 500 });
}
