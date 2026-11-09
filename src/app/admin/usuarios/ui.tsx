"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/system-store";

const input =
  "w-full rounded border border-zinc-700 bg-transparent px-3 py-2 text-sm";

export function UsuariosUI({ initial }: { initial: User[] }) {
  const [users, setUsers] = useState<User[]>(initial);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");

  async function refresh() {
    const r = await fetch("/api/admin/users");
    if (r.ok) setUsers((await r.json()).users as User[]);
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const r = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password, role }),
    });
    if (!r.ok) {
      setError((await r.json()).error ?? "error");
      return;
    }
    setName("");
    setPassword("");
    await refresh();
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="mb-3 text-xl font-semibold">Usuarios</h1>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-400">
              <th className="py-1">Nombre</th>
              <th className="py-1">Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-zinc-800">
                <td className="py-1">{u.name}</td>
                <td className="py-1">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="mb-3 font-medium">Crear usuario</h2>
        <form onSubmit={crear} className="max-w-xs space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Usuario"
            autoComplete="off"
            className={input}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Contraseña"
            autoComplete="new-password"
            className={input}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} className={input}>
            <option value="user">user</option>
            <option value="admin">admin</option>
            <option value="owner">owner</option>
          </select>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit">Crear</Button>
        </form>
      </section>
    </div>
  );
}
