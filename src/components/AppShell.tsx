"use client";

import { Files, Plus, Search, Settings, ShieldCheck, X } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NoteList } from "./NoteList";
import { SearchBox } from "./SearchBox";
import { Button } from "./ui/button";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
} from "./ui/select";

interface WorkspaceItem {
  id: string;
  name: string;
  perms: string[];
}

interface SearchHit {
  id: string;
  snippet: string;
}

type SaveState = "idle" | "saving" | "saved" | "error";

interface AppShellProps {
  children?: ReactNode;
  onSelectNote?: (wsId: string, noteId: string) => void;
  onNewNote?: () => void;
  canCreate?: boolean;
  onCloseTab?: () => void;
  tabTitle?: string | null;
  tabBadge?: string | null;
  saveState?: SaveState;
  /** Workspace abierto en la página (la sidebar lo preselecciona). */
  activeWsId?: string;
}

const SAVE_LABEL: Record<SaveState, string> = {
  idle: "",
  saving: "Guardando…",
  saved: "Guardado",
  error: "Error al guardar",
};

function RibbonButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-md transition-colors ${
        active
          ? "bg-[color-mix(in_srgb,var(--primary)_20%,transparent)] text-primary"
          : "text-(--ribbon-foreground) hover:bg-white/5 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// Shell estilo Obsidian: riel de iconos | árbol de notas | tabs + contenido,
// con barra de estado abajo. Los grants los aplican las rutas API (401/403);
// aquí solo se muestran.
export function AppShell({
  children,
  onSelectNote,
  onNewNote,
  canCreate,
  onCloseTab,
  tabTitle,
  tabBadge,
  saveState = "idle",
  activeWsId,
}: AppShellProps) {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [wsId, setWsId] = useState(activeWsId ?? "");
  const [notes, setNotes] = useState<string[]>([]);
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/workspaces");
      if (res.status === 401) {
        setError("Sin sesión — entra en /login");
        return;
      }
      if (!res.ok) {
        setError("No se pudieron cargar los workspaces");
        return;
      }
      const data = (await res.json()) as { workspaces: WorkspaceItem[] };
      setWorkspaces(data.workspaces);
      setWsId((prev) => prev || data.workspaces[0]?.id || "");
    })().catch(() => setError("No se pudieron cargar los workspaces"));
    // El riel muestra admin solo a quien pase el gate (200 = owner|admin).
    (async () => {
      try {
        const res = await fetch("/api/admin/users");
        setIsAdmin(res.ok);
      } catch {
        setIsAdmin(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (activeWsId) setWsId(activeWsId);
  }, [activeWsId]);

  useEffect(() => {
    if (!wsId) return;
    setHits(null);
    setSelected(null);
    (async () => {
      const res = await fetch(`/api/w/${encodeURIComponent(wsId)}/notes`);
      if (!res.ok) return;
      const data = (await res.json()) as { notes: string[] };
      setNotes(data.notes);
    })().catch(() => {});
  }, [wsId]);

  const onSearch = useCallback(
    async (q: string) => {
      if (!wsId) return;
      if (!q.trim()) {
        setHits(null);
        return;
      }
      const res = await fetch(
        `/api/w/${encodeURIComponent(wsId)}/search?q=${encodeURIComponent(q)}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as { results: SearchHit[] };
      setHits(data.results);
    },
    [wsId],
  );

  const focusSearch = useCallback(() => {
    setLeftOpen(true);
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>('[role="searchbox"]')
        ?.focus();
    });
  }, []);

  const shown = hits ? hits.map((h) => h.id) : notes;
  const wsName = workspaces.find((w) => w.id === wsId)?.name ?? "";
  const saveLabel = SAVE_LABEL[saveState];

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <nav
        aria-label="Riel"
        className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-border bg-(--ribbon) py-2 text-(--ribbon-foreground)"
      >
        <RibbonButton
          label={leftOpen ? "Ocultar archivos" : "Mostrar archivos"}
          onClick={() => setLeftOpen((v) => !v)}
          active={leftOpen}
        >
          <Files size={18} strokeWidth={1.75} />
        </RibbonButton>
        <RibbonButton label="Buscar (⌘K)" onClick={focusSearch}>
          <Search size={18} strokeWidth={1.75} />
        </RibbonButton>
        <div className="mt-auto flex flex-col items-center gap-1">
          {isAdmin && (
            <RibbonButton
              label="Administración"
              onClick={() => router.push("/admin/usuarios")}
            >
              <ShieldCheck size={18} strokeWidth={1.75} />
            </RibbonButton>
          )}
          <RibbonButton
            label="Ajustes"
            onClick={() => router.push("/ajustes/apariencia")}
          >
            <Settings size={18} strokeWidth={1.75} />
          </RibbonButton>
        </div>
      </nav>

      {leftOpen && (
        <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
          <div className="flex items-center gap-1 p-2">
            <Select value={wsId} onValueChange={(v) => typeof v === "string" && setWsId(v)}>
              <SelectTrigger aria-label="Workspace" className="min-w-0 flex-1" />
              <SelectPopup>
                {workspaces.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectPopup>
            </Select>
            {canCreate && onNewNote && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onNewNote}
                aria-label="Nota nueva"
                title="Nota nueva"
              >
                <Plus size={16} />
              </Button>
            )}
          </div>
          <div className="px-2 pb-2">
            <SearchBox onSearch={onSearch} />
          </div>
          <div className="min-h-0 flex-1">
            {error ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">{error}</p>
            ) : (
              <NoteList
                notes={shown}
                selected={selected}
                onSelect={(id) => {
                  setSelected(id);
                  if (wsId) onSelectNote?.(wsId, id);
                }}
              />
            )}
          </div>
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {tabTitle != null && (
          <div className="flex h-9 shrink-0 items-stretch gap-1 border-b border-border bg-sidebar px-2 pt-1">
            <div className="flex min-w-0 items-center gap-2 rounded-t-md border border-b-0 border-border bg-background px-3 text-sm">
              <span className="truncate" title={tabTitle}>
                {tabTitle}
              </span>
              {tabBadge && (
                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                  {tabBadge}
                </span>
              )}
              {onCloseTab && (
                <button
                  type="button"
                  aria-label="Cerrar nota"
                  onClick={onCloseTab}
                  className="rounded p-0.5 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {canCreate && onNewNote && (
              <button
                type="button"
                aria-label="Nota nueva"
                title="Nota nueva"
                onClick={onNewNote}
                className="flex items-center rounded-t-md px-2 text-muted-foreground hover:bg-white/5 hover:text-foreground"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
        )}

        <main className="min-h-0 flex-1 overflow-auto">{children}</main>

        <footer className="flex h-6 shrink-0 items-center gap-2 border-t border-border bg-sidebar px-3 text-[11px] text-muted-foreground">
          <span className="truncate font-medium text-sidebar-foreground">
            {wsName || "Ónix"}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {notes.length} nota{notes.length === 1 ? "" : "s"}
          </span>
          {saveLabel && (
            <>
              <span aria-hidden="true">·</span>
              <span aria-live="polite">{saveLabel}</span>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}
