import { getSession } from "@/lib/session";
import { listUsers, type User } from "@/lib/system-store";

// Solo owner|admin. Sin sesión → null (el llamador responde 401);
// con sesión pero rol user → null (el llamador responde 403).
export async function adminFrom(req: Request): Promise<User | null> {
  const s = await getSession(req);
  if (!s) return null;
  const me = (await listUsers()).find((u) => u.id === s.userId) ?? null;
  if (!me || (me.role !== "owner" && me.role !== "admin")) return null;
  return me;
}

// Para rutas API: sin sesión → 401; sin rol owner|admin → 403.
export async function requireAdmin(req: Request): Promise<User> {
  const s = await getSession(req);
  if (!s) throw Object.assign(new Error("no autorizado"), { status: 401 });
  const me = await adminFrom(req);
  if (!me) throw Object.assign(new Error("sin permiso"), { status: 403 });
  return me;
}
