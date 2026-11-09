import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, signSession } from "@/lib/session";
import { verifyUser } from "@/lib/system-store";

async function login(formData: FormData) {
  "use server";
  const user = await verifyUser(
    String(formData.get("name") ?? ""),
    String(formData.get("password") ?? ""),
  );
  if (!user) redirect("/login?error=1");
  (await cookies()).set(SESSION_COOKIE, await signSession(user.id, user.role), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/");
}

async function LoginForm({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <form action={login} className="w-full max-w-xs space-y-3">
      <h1 className="text-xl font-semibold">Ónix — entrar</h1>
      {error && <p className="text-sm text-red-500">Usuario o contraseña inválidos</p>}
      <input
        name="name"
        autoComplete="username"
        placeholder="Usuario"
        className="w-full rounded border border-input bg-transparent px-3 py-2"
      />
      <input
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Contraseña"
        className="w-full rounded border border-input bg-transparent px-3 py-2"
      />
      <button type="submit" className="w-full rounded bg-primary px-3 py-2 text-primary-foreground">
        Entrar
      </button>
    </form>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="flex min-h-full flex-col items-center justify-center px-4">
      <Suspense>
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
