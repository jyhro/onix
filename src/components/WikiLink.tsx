"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function noteHref(ws: string, id: string): string {
  const segs = id
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `/w/${encodeURIComponent(ws)}/n/${segs}`;
}

function apiNoteUrl(ws: string, id: string): string {
  const segs = id
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `/api/w/${encodeURIComponent(ws)}/notes/${segs}`;
}

interface WikiLinkProps {
  ws: string;
  /** Target crudo del `[[...]]`; puede venir sin trim (`[[ foo ]]` → `" foo "`). */
  target: string;
  label?: string;
  exists: boolean;
  canWrite: boolean;
}

// `[[x]]`: existe → navega; no existe → estilo "por crear" que crea y abre.
// El target se trimea para comparar y navegar (tolerancia a `[[ foo ]]`).
export function WikiLink({
  ws,
  target,
  label,
  exists,
  canWrite,
}: WikiLinkProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const name = target.trim();
  const text = label ?? name;
  const href = noteHref(ws, name);

  if (exists) {
    return (
      <a
        href={href}
        data-wikilink={name}
        data-exists="true"
        className="font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        onClick={(e) => {
          e.preventDefault();
          router.push(href);
        }}
      >
        {text}
      </a>
    );
  }

  // No existe: crea con contenido vacío y abre. GET primero: si otro la creó
  // mientras tanto, no la pisamos con "".
  const createAndGo = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (canWrite) {
        const probe = await fetch(apiNoteUrl(ws, name));
        if (probe.status === 404) {
          await fetch(`/api/w/${encodeURIComponent(ws)}/notes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: name, content: "" }),
          });
        }
      }
    } catch {
      // Sin red → navegar igual; la página/API aplican el gate.
    }
    setBusy(false);
    router.push(href);
  };

  return (
    <a
      href={href}
      data-wikilink={name}
      data-exists="false"
      title="Por crear — clic para crearla"
      className="font-medium text-amber-600 underline decoration-dashed decoration-amber-500/70 underline-offset-4 hover:bg-amber-500/10 dark:text-amber-400"
      onClick={createAndGo}
    >
      {text}
    </a>
  );
}
