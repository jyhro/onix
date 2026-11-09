"use client";

import { useEffect, useState } from "react";
import { Select, SelectItem, SelectPopup, SelectTrigger } from "./ui/select";

export const COLOR_PRESETS = ["neutral", "stone", "zinc", "slate"] as const;
export type ColorPreset = (typeof COLOR_PRESETS)[number];
export const COLOR_PRESET_KEY = "onix-color-preset";
export const DEFAULT_PRESET: ColorPreset = "neutral";

const LABELS: Record<ColorPreset, string> = {
  neutral: "Neutro",
  stone: "Piedra",
  zinc: "Zinc",
  slate: "Pizarra",
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
}

// Selector de preset de color (Ajustes → Apariencia → Color).
// Persiste en localStorage y refleja en `data-theme` de <html>.
export function ThemeSwitcher() {
  const [preset, setPreset] = useState<ColorPreset>(DEFAULT_PRESET);

  useEffect(() => {
    const stored = readStoredPreset();
    setPreset(stored);
    applyColorPreset(stored);
  }, []);

  const onValueChange = (v: unknown) => {
    const next = typeof v === "string" && isPreset(v) ? v : DEFAULT_PRESET;
    setPreset(next);
    applyColorPreset(next);
    try {
      localStorage.setItem(COLOR_PRESET_KEY, next);
    } catch {
      // Sin almacenamiento: el cambio solo vive en esta sesión.
    }
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
