import { NextResponse } from "next/server";
import { listNotes, writeNote } from "@/lib/vault";
import { errRes, readJson, workspaceRoot } from "../lib";

export async function GET(_req: Request, { params }: { params: Promise<{ ws: string }> }) {
  try {
    const root = workspaceRoot((await params).ws);
    return NextResponse.json({ notes: await listNotes(root) });
  } catch (e) {
    return errRes(e);
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ ws: string }> }) {
  try {
    const root = workspaceRoot((await params).ws);
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
