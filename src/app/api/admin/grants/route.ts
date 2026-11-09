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
      const perms = body.perms ?? body.perm ?? "read";
      const list = (Array.isArray(perms) ? perms : [perms]) as Perm[];
      const g = await grant(body.userId, body.wsId, list);
      return NextResponse.json({ grant: g }, { status: 201 });
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
