import { NextResponse } from "next/server";
import { searchNotes } from "@/lib/search";
import { errRes, workspaceRoot } from "../lib";

export async function GET(req: Request, { params }: { params: Promise<{ ws: string }> }) {
  try {
    const root = workspaceRoot((await params).ws);
    const q = new URL(req.url).searchParams.get("q") ?? "";
    return NextResponse.json({ results: await searchNotes(root, q) });
  } catch (e) {
    return errRes(e);
  }
}
