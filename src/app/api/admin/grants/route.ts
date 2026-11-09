import { NextResponse } from "next/server";
import {
  createWorkspace,
  grant,
  listGrants,
  listUsers,
  listWorkspaces,
  type Perm,
} from "@/lib/system-store";
import { errRes, readJson } from "@/app/api/w/[ws]/lib";
import { requireAdmin } from "../lib";

export async function GET(req: Request): Promise<NextResponse> {
  try {
    await requireAdmin(req);
    const [users, workspaces, grants] = await Promise.all([
      listUsers(),
      listWorkspaces(),
      listGrants(),
    ]);
    return NextResponse.json({ users, workspaces, grants });
  } catch (e) {
    return errRes(e);
  }
}

// Crea workspace ({ name }) u otorga grant ({ userId, wsId, perm|perms }).
export async function POST(req: Request): Promise<NextResponse> {
  try {
    await requireAdmin(req);
    const body = await readJson<{
      name?: unknown;
      userId?: unknown;
      wsId?: unknown;
      perm?: unknown;
      perms?: unknown;
    }>(req);
    if (typeof body.userId === "string" && typeof body.wsId === "string") {
      if (typeof body.name !== "undefined") {
        throw Object.assign(new Error("cuerpo mixto: { name } o { userId, wsId, perm }"), {
          status: 400,
        });
      }
      const perms = body.perms ?? body.perm ?? "read";
      const list = (Array.isArray(perms) ? perms : [perms]) as Perm[];
      if (list.length === 0) {
        throw Object.assign(new Error("perms vacío: se esperaba al menos un permiso"), {
          status: 400,
        });
      }
      for (const p of list) {
        if (p !== "read" && p !== "write") {
          throw Object.assign(new Error(`permiso inválido: ${String(p)}`), { status: 400 });
        }
      }
      const [users, workspaces] = await Promise.all([listUsers(), listWorkspaces()]);
      if (!users.some((u) => u.id === body.userId)) {
        throw Object.assign(new Error("usuario no existe"), { status: 404 });
      }
      if (!workspaces.some((w) => w.id === body.wsId)) {
        throw Object.assign(new Error("workspace no existe"), { status: 404 });
      }
      const g = await grant(body.userId, body.wsId, list);
      return NextResponse.json({ grant: g }, { status: 201 });
    }
    if (typeof body.userId !== "undefined" || typeof body.wsId !== "undefined") {
      if (typeof body.name !== "undefined") {
        throw Object.assign(new Error("cuerpo mixto: { name } o { userId, wsId, perm }"), {
          status: 400,
        });
      }
      throw Object.assign(new Error("se esperaba { userId, wsId, perm }"), { status: 400 });
    }
    if (typeof body.name === "string") {
      const ws = await createWorkspace(body.name);
      return NextResponse.json({ workspace: ws }, { status: 201 });
    }
    throw Object.assign(new Error("se esperaba { name } o { userId, wsId, perm }"), {
      status: 400,
    });
  } catch (e) {
    return errRes(e);
  }
}
