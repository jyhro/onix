"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";

// Landing del workspace: mismo AppShell que la página de nota pero sin
// nota seleccionada (el gate de grants ya se aplicó en el server component).
export function WsLandingView() {
  const router = useRouter();
  return (
    <AppShell
      onSelectNote={(wsId, noteId) =>
        router.push(
          `/w/${encodeURIComponent(wsId)}/n/${noteId
            .split("/")
            .map((s) => encodeURIComponent(s))
            .join("/")}`,
        )
      }
    >
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Selecciona una nota</p>
      </div>
    </AppShell>
  );
}
