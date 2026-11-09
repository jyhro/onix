export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <nav className="flex items-center gap-4 text-sm">
        <span className="font-semibold">Ónix — admin</span>
        <a href="/admin/usuarios" className="underline">
          Usuarios
        </a>
        <a href="/admin/workspaces" className="underline">
          Workspaces
        </a>
      </nav>
      {children}
    </main>
  );
}
