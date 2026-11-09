"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { createUntitledNote, noteUrl } from "@/lib/new-note";

// Landing del workspace: mismo AppShell que la página de nota pero sin
// nota seleccionada (el gate de grants ya se aplicó en el server component).
export function WsLandingView({ ws, canWrite }: { ws: string; canWrite: boolean }) {
  const router = useRouter();

  const newNote = useCallback(async () => {
    try {
      const id = await createUntitledNote(ws);
      router.push(noteUrl(ws, id));
    } catch {
      // 403 u otro: la API ya denegó; no hay nada que navegar.
    }
  }, [ws, router]);

  return (
    <AppShell
      activeWsId={ws}
      canCreate={canWrite}
      onNewNote={canWrite ? newNote : undefined}
      onSelectNote={(wsId, noteId) => router.push(noteUrl(wsId, noteId))}
    >
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-sm text-muted-foreground">Selecciona una nota</p>
        {canWrite && (
          <button
            type="button"
            onClick={newNote}
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
          >
            Nota nueva
          </button>
        )}
      </div>
    </AppShell>
  );
}
