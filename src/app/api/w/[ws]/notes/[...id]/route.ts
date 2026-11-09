import { NextResponse } from "next/server";
import { deleteNote, readNote, writeNote } from "@/lib/vault";
import type { Perm } from "@/lib/system-store";
import { errRes, readJson, requireGrant, workspaceRoot } from "../../lib";

type Params = { params: Promise<{ ws: string; id: string[] }> };

async function ctx(req: Request, p: Params, perm: Perm): Promise<{ root: string; id: string }> {
  const { ws, id } = await p.params;
  await requireGrant(req, ws, perm);
  return { root: workspaceRoot(ws), id: id.join("/") };
}

export async function GET(req: Request, p: Params) {
  try {
    const { root, id } = await ctx(req, p, "read");
    return NextResponse.json(await readNote(root, id));
  } catch (e) {
    return errRes(e);
  }
}

export async function PUT(req: Request, p: Params) {
  try {
    const { root, id } = await ctx(req, p, "write");
    const { content } = await readJson<{ content: string }>(req);
    await writeNote(root, id, content);
    return NextResponse.json({ id });
  } catch (e) {
    return errRes(e);
  }
}

export async function DELETE(req: Request, p: Params) {
  try {
    const { root, id } = await ctx(req, p, "write");
    await deleteNote(root, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errRes(e);
  }
}
