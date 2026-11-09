import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { requireGrant, workspaceRoot } from "@/app/api/w/[ws]/lib";
import { NoteView } from "@/components/NoteEditor";
import { SESSION_COOKIE } from "@/lib/session";
import { readNote } from "@/lib/vault";

type Params = { params: Promise<{ ws: string; id: string }> };

// Notas por usuario y grants: ruta bloqueante (nunca prerender).
export const instant = false;

function reqFromCookies(token: string): Request {
  return new Request("http://localhost", {
    headers: { cookie: `${SESSION_COOKIE}=${token}` },
  });
}

function statusOf(e: unknown): number | undefined {
  return (e as { status?: number })?.status;
}

// Gate server-side (Task 6): el middleware (Edge) no puede leer grants;
// sin sesión → /login, sin grant de lectura → 404 (no filtrar existencia).
// Va en Suspense como en las páginas admin: `cookies()` impide prerender.
async function NoteGate({ ws, id }: { ws: string; id: string }) {
  const noteId = decodeURIComponent(id);
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? "";
  const req = reqFromCookies(token);

  try {
    await requireGrant(req, ws, "read");
  } catch (e) {
    if (statusOf(e) === 401) redirect("/login");
    notFound();
  }

  let canWrite = false;
  try {
    await requireGrant(req, ws, "write");
    canWrite = true;
  } catch {
    canWrite = false;
  }

  let content: string;
  try {
    content = (await readNote(workspaceRoot(ws), noteId)).content;
  } catch {
    notFound();
  }

  return (
    <NoteView
      ws={ws}
      id={noteId}
      initialContent={content}
      canWrite={canWrite}
    />
  );
}

export default async function NotePage({ params }: Params) {
  const { ws, id } = await params;
  return (
    <Suspense>
      <NoteGate ws={ws} id={id} />
    </Suspense>
  );
}
