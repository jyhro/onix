import { NextResponse } from "next/server";
import { createUser, listUsers, type Role } from "@/lib/system-store";
import { errRes, readJson } from "@/app/api/w/[ws]/lib";
import { requireAdmin } from "../lib";

export async function GET(req: Request): Promise<NextResponse> {
  try {
    await requireAdmin(req);
    return NextResponse.json({ users: await listUsers() });
  } catch (e) {
    return errRes(e);
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    await requireAdmin(req);
    const body = await readJson<{ name?: unknown; password?: unknown; role?: unknown }>(req);
    const role = body.role ?? "user";
    if (role !== "owner" && role !== "admin" && role !== "user") {
      throw Object.assign(new Error(`rol inválido: ${String(role)}`), { status: 400 });
    }
    const user = await createUser({
      name: typeof body.name === "string" ? body.name : "",
      password: typeof body.password === "string" ? body.password : "",
      role: role as Role,
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    return errRes(e);
  }
}
