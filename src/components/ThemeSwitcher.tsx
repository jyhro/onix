"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Select, SelectItem, SelectPopup, SelectTrigger } from "./ui/select";

export const COLOR_PRESETS = ["obsidian", "obsidian-claro"] as const;
export type ColorPreset = (typeof COLOR_PRESETS)[number];
export const COLOR_PRESET_KEY = "onix-color-preset";
export const DEFAULT_PRESET: ColorPreset = "obsidian";

const LABELS: Record<ColorPreset, string> = {
  obsidian: "Obsidiana (oscuro)",
  "obsidian-claro": "Obsidiana claro",
};

function isPreset(v: string | null): v is ColorPreset {
  return (
    v !== null && (COLOR_PRESETS as readonly string[]).includes(v as string)
  );
}

// Lee el preset guardado; fuera del componente para probarlo sin DOM.
export function readStoredPreset(): ColorPreset {
  try {
    const v = localStorage.getItem(COLOR_PRESET_KEY);
    if (isPreset(v)) return v;
  } catch {
    // localStorage no disponible: cae al valor por defecto.
  }
  return DEFAULT_PRESET;
}

export function applyColorPreset(preset: ColorPreset): void {
  document.documentElement.dataset.theme = preset;
  try {
    localStorage.setItem(COLOR_PRESET_KEY, preset);
  } catch {
    // Sin almacenamiento: el cambio solo vive en esta sesión.
  }
}

// Selector de preset de color (Ajustes → Apariencia → Color).
// next-themes es la fuente de verdad (`data-theme`); la clave local solo
// sirve al script pre-paint de layout para evitar el flash inicial.
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [preset, setPreset] = useState<ColorPreset>(DEFAULT_PRESET);

  useEffect(() => {
    setPreset(isPreset(theme ?? null) ? theme as ColorPreset : readStoredPreset());
  }, [theme]);

  const onValueChange = (v: unknown) => {
    const next = typeof v === "string" && isPreset(v) ? v : DEFAULT_PRESET;
    setPreset(next);
    setTheme(next);
    applyColorPreset(next);
  };

  return (
    <Select value={preset} onValueChange={onValueChange}>
      <SelectTrigger />
      <SelectPopup>
        {COLOR_PRESETS.map((p) => (
          <SelectItem key={p} value={p}>
            {LABELS[p]}
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  );
}
