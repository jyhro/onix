"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { NoteList } from "./NoteList";
import { SearchBox } from "./SearchBox";
import { Button } from "./ui/button";

interface WorkspaceItem {
  id: string;
  name: string;
  perms: string[];
}

interface SearchHit {
  id: string;
  snippet: string;
}

interface AppShellProps {
  children?: ReactNode;
  right?: ReactNode;
  onSelectNote?: (wsId: string, noteId: string) => void;
}

// Layout de 3 paneles colapsables: sidebar | contenido | panel derecho.
// Los grants los aplican las rutas API (401/403); aquí solo se muestran.
export function AppShell({ children, right, onSelectNote }: AppShellProps) {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [wsId, setWsId] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

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

  const shown = hits ? hits.map((h) => h.id) : notes;

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {leftOpen && (
        <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          <div className="flex items-center gap-2 p-2">
            <select
              aria-label="Workspace"
              value={wsId}
              onChange={(e) => setWsId(e.target.value)}
              className="h-8 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 text-sm outline-none"
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setLeftOpen(false)}
              aria-label="Ocultar barra lateral"
            >
              ‹
            </Button>
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
      {!leftOpen && (
        <div className="flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setLeftOpen(true)}
            aria-label="Mostrar barra lateral"
          >
            ›
          </Button>
        </div>
      )}

      <main className="min-w-0 flex-1 overflow-auto">{children}</main>

      {rightOpen ? (
        <aside className="flex w-64 shrink-0 flex-col border-l border-sidebar-border bg-sidebar text-sidebar-foreground">
          <div className="flex items-center justify-between p-2">
            <span className="px-1 text-sm font-medium">Panel</span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setRightOpen(false)}
              aria-label="Ocultar panel derecho"
            >
              ›
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-3 pb-3 text-sm text-muted-foreground">
            {right ?? "Sin contenido"}
          </div>
        </aside>
      ) : (
        <div className="flex shrink-0 flex-col border-l border-sidebar-border bg-sidebar p-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setRightOpen(true)}
            aria-label="Mostrar panel derecho"
          >
            ‹
          </Button>
        </div>
      )}
    </div>
  );
}
