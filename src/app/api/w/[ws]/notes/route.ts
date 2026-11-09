import { NextResponse } from "next/server";
import { listNotes, writeNote } from "@/lib/vault";
import { errRes, readJson, requireGrant, workspaceRoot } from "../lib";

export async function GET(req: Request, { params }: { params: Promise<{ ws: string }> }) {
  try {
    const { ws } = await params;
    await requireGrant(req, ws, "read");
    const root = workspaceRoot(ws);
    return NextResponse.json({ notes: await listNotes(root) });
  } catch (e) {
    return errRes(e);
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ ws: string }> }) {
  try {
    const { ws } = await params;
    await requireGrant(req, ws, "write");
    const root = workspaceRoot(ws);
    const body = await readJson<{ id: unknown; content: unknown }>(req);
    if (typeof body.id !== "string" || typeof body.content !== "string") {
      throw Object.assign(new Error("id y content deben ser strings"), { status: 400 });
    }
    await writeNote(root, body.id, body.content);
    return NextResponse.json({ id: body.id.trim() }, { status: 201 });
  } catch (e) {
    return errRes(e);
  }
}
