import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { requireGrant, workspaceRoot } from "@/app/api/w/[ws]/lib";
import { SESSION_COOKIE } from "@/lib/session";
import { listNotes } from "@/lib/vault";
import { WsLandingView } from "./landing-view";

type Params = { params: Promise<{ ws: string }> };

// Landing del workspace: ruta bloqueante (nunca prerender).
export const instant = false;

function reqFromCookies(token: string): Request {
  return new Request("http://localhost", {
    headers: { cookie: `${SESSION_COOKIE}=${token}` },
  });
}

function statusOf(e: unknown): number | undefined {
  return (e as { status?: number })?.status;
}

// Gate server-side como en `n/[...id]`: sin sesión → /login,
// sin grant de lectura → 404 (no filtrar existencia).
async function WsGate({ ws }: { ws: string }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? "";
  const req = reqFromCookies(token);

  try {
    await requireGrant(req, ws, "read");
  } catch (e) {
    if (statusOf(e) === 401) redirect("/login");
    notFound();
  }

  try {
    await listNotes(workspaceRoot(ws));
  } catch {
    notFound();
  }

  return <WsLandingView />;
}

export default async function WsPage({ params }: Params) {
  const { ws } = await params;
  return (
    <Suspense>
      <WsGate ws={ws} />
    </Suspense>
  );
}
