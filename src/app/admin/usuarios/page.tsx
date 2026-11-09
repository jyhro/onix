import { Suspense } from "react";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";
import { listUsers } from "@/lib/system-store";
import { adminFrom } from "@/app/api/admin/lib";
import { UsuariosUI } from "./ui";

// Como en setup: el chequeo con cookies() vive en un hijo de Suspense para
// que el prerender no falle (el build prerenderiza sin cookies → 403).
async function UsuariosGate() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? "";
  const me = await adminFrom(
    new Request("http://localhost", { headers: { cookie: `${SESSION_COOKIE}=${token}` } }),
  );
  if (!me) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">403 — sin permiso</h1>
        <p className="text-sm text-zinc-400">Solo owner|admin pueden ver esta página.</p>
      </div>
    );
  }
  return <UsuariosUI initial={await listUsers()} />;
}

export default function UsuariosPage() {
  return (
    <Suspense>
      <UsuariosGate />
    </Suspense>
  );
}
