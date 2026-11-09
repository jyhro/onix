import { NextResponse } from "next/server";
import { errRes } from "@/app/api/w/[ws]/lib";
import { getSession } from "@/lib/session";
import { listGrants, listUsers, listWorkspaces } from "@/lib/system-store";

// Sidebar (Task 8a): qué workspaces ve la sesión.
// Sin sesión → 401. owner|admin → todos (read+write).
// user → solo los concedidos, con sus perms. Nunca filtra hashes:
// listUsers/listWorkspaces/listGrants solo devuelven datos públicos.
export async function GET(req: Request): Promise<NextResponse> {
  try {
    const s = await getSession(req);
    if (!s) throw Object.assign(new Error("no autorizado"), { status: 401 });
    const me = (await listUsers()).find((u) => u.id === s.userId);
    if (!me) throw Object.assign(new Error("sin permiso"), { status: 403 });
    const all = await listWorkspaces();
    if (me.role === "owner" || me.role === "admin") {
      return NextResponse.json({
        workspaces: all.map((w) => ({ ...w, perms: ["read", "write"] })),
      });
    }
    const mine = (await listGrants()).filter((g) => g.userId === s.userId);
    return NextResponse.json({
      workspaces: all
        .filter((w) => mine.some((g) => g.wsId === w.id))
        .map((w) => ({
          ...w,
          perms: mine.find((g) => g.wsId === w.id)?.perms ?? [],
        })),
    });
  } catch (e) {
    return errRes(e);
  }
}
