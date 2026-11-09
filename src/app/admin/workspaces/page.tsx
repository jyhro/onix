import { Suspense } from "react";
import { cookies } from "next/headers";
import { forbidden } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/session";
import { listGrants, listUsers, listWorkspaces } from "@/lib/system-store";
import { adminFrom } from "@/app/api/admin/lib";
import { WorkspacesUI } from "./ui";

async function currentAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? "";
  return adminFrom(
    new Request("http://localhost", { headers: { cookie: `${SESSION_COOKIE}=${token}` } }),
  );
}

// Segunda línea de defensa (el middleware ya devuelve 403 real para
// no-owner|admin): si se alcanza sin rol, `forbidden()` muestra forbidden.tsx.
async function WorkspacesGate() {
  const me = await currentAdmin();
  if (!me) forbidden();
  const [workspaces, grants, users] = await Promise.all([
    listWorkspaces(),
    listGrants(),
    listUsers(),
  ]);
  return (
    <WorkspacesUI
      initialWorkspaces={workspaces}
      initialGrants={grants}
      initialUsers={users}
    />
  );
}

export default function WorkspacesPage() {
  return (
    <Suspense>
      <WorkspacesGate />
    </Suspense>
  );
}
