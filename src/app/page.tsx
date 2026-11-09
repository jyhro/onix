import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession, SESSION_COOKIE } from "@/lib/session";
import { hasUsers, listGrants, listUsers, listWorkspaces } from "@/lib/system-store";
import { connection } from "next/server";

// Ruta bloqueante y dinámica: decide por request (cookies + JSON del
// sistema vía `connection()`; `instant = false` = convención del proyecto
// para rutas que no deben prerenderizarse, ver nota en w/[ws]/n/[...id]).
export const instant = false;

export default async function HomePage() {
  await connection();
  if (!(await hasUsers())) redirect("/setup");
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? "";
  const s = await getSession(
    new Request("http://localhost", {
      headers: { cookie: `${SESSION_COOKIE}=${token}` },
    }),
  );
  if (!s) redirect("/login");
  const me = (await listUsers()).find((u) => u.id === s.userId);
  if (!me) redirect("/login");
  const all = await listWorkspaces();
  const mine = me.role === "owner" || me.role === "admin" ? null : await listGrants();
  const visible =
    mine === null
      ? all
      : all.filter((w) => mine.some((g) => g.userId === s.userId && g.wsId === w.id));
  if (visible.length > 0) redirect(`/w/${visible[0].id}`);
  return (
    <main className="flex min-h-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-xs space-y-3 rounded-lg border border-border bg-card p-6 text-center">
        <h1 className="text-xl font-semibold text-foreground">Sin workspaces</h1>
        <p className="text-sm text-muted-foreground">Pide acceso al admin.</p>
        <a
          href="/login"
          className="inline-block text-sm text-primary underline-offset-4 hover:underline"
        >
          Volver a entrar
        </a>
      </div>
    </main>
  );
}
