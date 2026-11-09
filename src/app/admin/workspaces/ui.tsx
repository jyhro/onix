"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Grant, User, Workspace } from "@/lib/system-store";

const input =
  "w-full rounded border border-input bg-transparent px-3 py-2 text-sm";

export function WorkspacesUI({
  initialWorkspaces,
  initialGrants,
  initialUsers,
}: {
  initialWorkspaces: Workspace[];
  initialGrants: Grant[];
  initialUsers: User[];
}) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [grants, setGrants] = useState<Grant[]>(initialGrants);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [wsName, setWsName] = useState("");
  const [grantUser, setGrantUser] = useState("");
  const [grantWs, setGrantWs] = useState("");
  const [grantPerm, setGrantPerm] = useState("read");
  const [error, setError] = useState("");

  async function refresh() {
    const r = await fetch("/api/admin/grants");
    if (!r.ok) return;
    const data = await r.json();
    setWorkspaces(data.workspaces as Workspace[]);
    setGrants(data.grants as Grant[]);
    setUsers(data.users as User[]);
  }

  const userName = (id: string) => users.find((u) => u.id === id)?.name ?? id;

  async function crearWs(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const r = await fetch("/api/admin/grants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: wsName }),
    });
    if (!r.ok) {
      setError((await r.json()).error ?? "error");
      return;
    }
    setWsName("");
    await refresh();
  }

  async function otorgar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const r = await fetch("/api/admin/grants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: grantUser, wsId: grantWs, perm: grantPerm }),
    });
    if (!r.ok) {
      setError((await r.json()).error ?? "error");
      return;
    }
    await refresh();
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="mb-3 text-xl font-semibold">Workspaces</h1>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-1">Nombre</th>
              <th className="py-1">Grants</th>
            </tr>
          </thead>
          <tbody>
            {workspaces.map((w) => (
              <tr key={w.id} className="border-t border-border align-top">
                <td className="py-1">{w.name}</td>
                <td className="py-1">
                  {grants
                    .filter((g) => g.wsId === w.id)
                    .map((g) => `${userName(g.userId)}: ${g.perms.join("+")}`)
                    .join(", ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="mb-3 font-medium">Crear workspace</h2>
        <form onSubmit={crearWs} className="flex max-w-xs gap-2">
          <input
            value={wsName}
            onChange={(e) => setWsName(e.target.value)}
            placeholder="Nombre"
            autoComplete="off"
            className={input}
          />
          <Button type="submit">Crear</Button>
        </form>
      </section>
      <section>
        <h2 className="mb-3 font-medium">Otorgar acceso</h2>
        <form onSubmit={otorgar} className="max-w-xs space-y-3">
          <select
            value={grantWs}
            onChange={(e) => setGrantWs(e.target.value)}
            className={input}
          >
            <option value="">Workspace…</option>
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <select
            value={grantUser}
            onChange={(e) => setGrantUser(e.target.value)}
            className={input}
          >
            <option value="">Usuario…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
          <select
            value={grantPerm}
            onChange={(e) => setGrantPerm(e.target.value)}
            className={input}
          >
            <option value="read">read</option>
            <option value="write">write</option>
          </select>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit">Otorgar</Button>
        </form>
      </section>
    </div>
  );
}
