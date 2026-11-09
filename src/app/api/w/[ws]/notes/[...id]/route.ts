import { NextResponse } from "next/server";
import { deleteNote, readNote, writeNote } from "@/lib/vault";
import { errRes, readJson, workspaceRoot } from "../../lib";

type Params = { params: Promise<{ ws: string; id: string[] }> };

async function ctx(p: Params): Promise<{ root: string; id: string }> {
  const { ws, id } = await p.params;
  return { root: workspaceRoot(ws), id: id.join("/") };
}

export async function GET(_req: Request, p: Params) {
  try {
    const { root, id } = await ctx(p);
    return NextResponse.json(await readNote(root, id));
  } catch (e) {
    return errRes(e);
  }
}

export async function PUT(req: Request, p: Params) {
  try {
    const { root, id } = await ctx(p);
    const { content } = await readJson<{ content: string }>(req);
    await writeNote(root, id, content);
    return NextResponse.json({ id });
  } catch (e) {
    return errRes(e);
  }
}

export async function DELETE(_req: Request, p: Params) {
  try {
    const { root, id } = await ctx(p);
    await deleteNote(root, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errRes(e);
  }
}
