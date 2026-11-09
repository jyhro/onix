import { NextResponse } from "next/server";
import { searchNotes } from "@/lib/search";
import { errRes, requireGrant, workspaceRoot } from "../lib";

export async function GET(req: Request, { params }: { params: Promise<{ ws: string }> }) {
  try {
    const { ws } = await params;
    await requireGrant(req, ws, "read");
    const root = workspaceRoot(ws);
    const q = new URL(req.url).searchParams.get("q") ?? "";
    return NextResponse.json({ results: await searchNotes(root, q) });
  } catch (e) {
    return errRes(e);
  }
}
