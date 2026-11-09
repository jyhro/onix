import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createUser, hasUsers } from "@/lib/system-store";

async function setup(formData: FormData) {
  "use server";
  if (await hasUsers()) redirect("/login");
  try {
    await createUser({
      name: String(formData.get("name") ?? ""),
      password: String(formData.get("password") ?? ""),
      role: "owner",
    });
  } catch (e) {
    // Otro setup concurrente ya creó el primer usuario → ir a login.
    if ((e as { status?: number })?.status === 409) redirect("/login");
    throw e;
  }
  redirect("/login");
}

// Sin redirect aquí: en un hijo de Suspense el redirect no sobrevive al
// resume del prerender; la acción `setup` es la que impide crear de más.
async function SetupGate() {
  if (await hasUsers()) {
    return (
      <p className="text-sm">
        Ónix ya está configurado. <a href="/login" className="underline">Entrar</a>
      </p>
    );
  }
  return (
    <form action={setup} className="w-full max-w-xs space-y-3">
      <h1 className="text-xl font-semibold">Ónix — crear propietario</h1>
      <input
        name="name"
        autoComplete="username"
        placeholder="Usuario"
        className="w-full rounded border border-zinc-700 bg-transparent px-3 py-2"
      />
      <input
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Contraseña"
        className="w-full rounded border border-zinc-700 bg-transparent px-3 py-2"
      />
      <button type="submit" className="w-full rounded bg-zinc-100 px-3 py-2 text-zinc-900">
        Crear y ir a login
      </button>
    </form>
  );
}

export default function SetupPage() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center px-4">
      <Suspense>
        <SetupGate />
      </Suspense>
    </main>
  );
}
