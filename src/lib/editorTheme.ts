// Tema del editor según el preset de la app: todo lo que no sea
// obsidian-claro es oscuro. Puro y testeable sin DOM.
export function resolveEditorTheme(el: {
  classList: { contains(c: string): boolean };
  dataset: { theme?: string };
}): "dark" | "light" {
  return el.dataset.theme === "obsidian-claro" ? "light" : "dark";
}
