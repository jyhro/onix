import { NextResponse } from "next/server";
import { listNotes, writeNote } from "@/lib/vault";
import { errRes, workspaceRoot } from "../lib";

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
    const { id, content } = await req.json();
    await writeNote(root, id, content);
    return NextResponse.json({ id: (id as string).trim() }, { status: 201 });
  } catch (e) {
    return errRes(e);
  }
}
