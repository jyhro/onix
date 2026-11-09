import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export const metadata = {
  title: "Apariencia · Ajustes · Ónix",
  description: "Elige el color de la interfaz de Ónix",
};

export default function AparienciaPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
      <h1 className="text-xl font-semibold">Ajustes</h1>
      <h2 className="mt-6 text-sm font-medium text-muted-foreground">
        Apariencia
      </h2>
      <section className="mt-2 flex items-center justify-between gap-4 rounded-lg border border-border p-4">
        <div>
          <h3 className="text-sm font-medium">Color</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Paleta de la interfaz. Se guarda en este navegador.
          </p>
        </div>
        <ThemeSwitcher />
      </section>
    </main>
  );
}
