import { Suspense } from "react";
import { cookies } from "next/headers";
import { forbidden } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/session";
import { listUsers } from "@/lib/system-store";
import { adminFrom } from "@/app/api/admin/lib";
import { UsuariosUI } from "./ui";

async function currentAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? "";
  return adminFrom(
    new Request("http://localhost", { headers: { cookie: `${SESSION_COOKIE}=${token}` } }),
  );
}

// Segunda línea de defensa (el middleware ya devuelve 403 real para
// no-owner|admin): si se alcanza sin rol, `forbidden()` muestra forbidden.tsx.
async function UsuariosGate() {
  const me = await currentAdmin();
  if (!me) forbidden();
  return <UsuariosUI initial={await listUsers()} />;
}

export default function UsuariosPage() {
  return (
    <Suspense>
      <UsuariosGate />
    </Suspense>
  );
}
