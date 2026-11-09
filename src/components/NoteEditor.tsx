"use client";

import { markdown } from "@codemirror/lang-markdown";
import CodeMirror from "@uiw/react-codemirror";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppShell } from "./AppShell";
import { MarkdownPreview } from "./MarkdownPreview";
import { createUntitledNote, noteUrl } from "@/lib/new-note";
import { obsidianEditorTheme } from "./obsidianEditorTheme";

export type SaveState = "idle" | "saving" | "saved" | "error";

// El editor sigue el tema de la app: oscuro si <html> lleva `.dark`
// (o data-theme="dark"); los presets de color viven en `data-theme`.
// Exportada para probarla sin DOM.
export function resolveEditorTheme(el: {
  classList: { contains(c: string): boolean };
  dataset: { theme?: string };
}): "dark" | "light" {
  return el.classList.contains("dark") || el.dataset.theme === "dark"
    ? "dark"
    : "light";
}

// Lee el tema actual de <html> y lo sigue ante cambios (Ajustes → Apariencia).
function useEditorTheme(): "dark" | "light" {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  useEffect(() => {
    const el = document.documentElement;
    setTheme(resolveEditorTheme(el));
    const obs = new MutationObserver(() =>
      setTheme(resolveEditorTheme(el)),
    );
    obs.observe(el, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => obs.disconnect();
  }, []);
  return theme;
}

function apiUrl(ws: string, id: string): string {
  const segs = id
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `/api/w/${encodeURIComponent(ws)}/notes/${segs}`;
}

interface NoteEditorProps {
  ws: string;
  id: string;
  initialContent: string;
  canWrite: boolean;
  /** Ids con grant para el preview (GET /api/w/[ws]/notes). */
  ids: string[];
  /** Notifica guardados a quien renderiza (barra de estado del shell). */
  onStatusChange?: (s: SaveState) => void;
}

// Editor markdown con guardado automático (debounce 800 ms).
// ⌘S/Ctrl+S solo evita el diálogo del navegador; guardar ya es automático.
export function NoteEditor({
  ws,
  id,
  initialContent,
  canWrite,
  ids,
  onStatusChange,
}: NoteEditorProps) {
  const [value, setValue] = useState(initialContent);
  const editorTheme = useEditorTheme();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  // ⌘S/Ctrl+S no hace nada dañino: evita el diálogo del navegador
  // (guardar ya es automático por debounce).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onChange = useCallback(
    (v: string) => {
      setValue(v);
      if (!canWrite) return;
      onStatusChange?.("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        try {
          const res = await fetch(apiUrl(ws, id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: v }),
          });
          if (!res.ok) throw new Error(`PUT ${res.status}`);
          onStatusChange?.("saved");
        } catch {
          onStatusChange?.("error");
        }
      }, 800);
    },
    [ws, id, canWrite, onStatusChange],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="min-h-0 flex-1 overflow-auto">
          <CodeMirror
            value={value}
            onChange={onChange}
            extensions={[markdown()]}
            theme={editorTheme === "dark" ? obsidianEditorTheme : "light"}
            editable={canWrite}
            basicSetup={{ lineNumbers: true, foldGutter: false }}
            className="h-full"
          />
        </div>
        <div className="min-h-0 flex-1 border-t border-border md:border-t-0 md:border-l">
          <MarkdownPreview
            ws={ws}
            content={value}
            ids={ids}
            canWrite={canWrite}
          />
        </div>
      </div>
    </div>
  );
}

// Página cliente: monta el editor dentro del AppShell (el gate de grants
// ya se aplicó en el server component). `key` reinicia el editor al cambiar de nota.
export function NoteView(props: NoteEditorProps) {
  const router = useRouter();
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const newNote = useCallback(async () => {
    try {
      const id = await createUntitledNote(props.ws);
      router.push(noteUrl(props.ws, id));
    } catch {
      // 403 u otro: la API ya denegó; no hay nada que navegar.
    }
  }, [props.ws, router]);

  return (
    <AppShell
      activeWsId={props.ws}
      tabTitle={props.id}
      tabBadge={props.canWrite ? null : "Solo lectura"}
      onCloseTab={() =>
        router.push(`/w/${encodeURIComponent(props.ws)}`)
      }
      canCreate={props.canWrite}
      onNewNote={props.canWrite ? newNote : undefined}
      saveState={saveState}
      onSelectNote={(wsId, noteId) => router.push(noteUrl(wsId, noteId))}
    >
      <NoteEditor
        key={`${props.ws}/${props.id}`}
        {...props}
        onStatusChange={setSaveState}
      />
    </AppShell>
  );
}
