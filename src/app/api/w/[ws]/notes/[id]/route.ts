import { NextResponse } from "next/server";
import { deleteNote, readNote, writeNote } from "@/lib/vault";
import { errRes, workspaceRoot } from "../../lib";

export async function GET(_req: Request, { params }: { params: Promise<{ ws: string; id: string }> }) {
  try {
    const { ws, id } = await params;
    return NextResponse.json(await readNote(workspaceRoot(ws), id));
  } catch (e) {
    return errRes(e);
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ ws: string; id: string }> }) {
  try {
    const { ws, id } = await params;
    const { content } = await req.json();
    await writeNote(workspaceRoot(ws), id, content);
    return NextResponse.json({ id });
  } catch (e) {
    return errRes(e);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ ws: string; id: string }> },
) {
  try {
    const { ws, id } = await params;
    await deleteNote(workspaceRoot(ws), id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errRes(e);
  }
}
