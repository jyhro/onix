export default function AdminForbidden() {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">403 — sin permiso</h1>
      <p className="text-sm text-muted-foreground">Solo owner|admin pueden ver esta página.</p>
    </div>
  );
}
