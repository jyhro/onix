---
version: 1
slug: "src-app-w-ws-n-id-page-tsx"
primary_target: "src/app/w/[ws]/n/[...id]/page.tsx"
related_targets: ["src/app/page.tsx","src/components/AppShell.tsx"]
---

# Brief: superficie vault (rediseño Obsidian)

Modo: Operate. Mundo: Obsidian fiel (fijado por el dueño, reemplaza shadcn neutral).

## Direction contract

THESIS: Ónix es Obsidian corriendo en la web: riel de iconos, árbol de notas con búsqueda, pestañas, editor y preview lado a lado, barra de estado. Se rehúsa el panel administrativo genérico shadcn (botones sueltos, selects nativos, tarjetas): cada átomo vive en el vocabulario Obsidian.

OWN-WORLD: grafito profundo (fondo #1e1e1e, paneles #262626, bordes #333), texto #dcddde, acento morado #a882ff para enlaces, activos, cursor y focos; tipografía de sistema para UI y mono del sistema para editor y datos; riel de 48px con iconos Lucide de trazo fino y tooltips; pestañas con título y cierre; status bar de 24px con workspace, estado de guardado y preset.

STORY: el usuario abre y ya está en su vault: explora el árbol, abre notas en pestañas, edita a la izquierda con preview a la derecha, sigue [[enlaces]] morados, cambia de workspace sin salir del riel; el admin gestiona usuarios y workspaces desde el mismo riel.

FIRST VIEWPORT: riel (archivos, buscar, ajustes, admin) | árbol con buscador encima | tabs con la nota activa + editor/preview | status bar (workspace · guardado · tema). Acción primaria: botón + en el árbol para nota nueva.

FORM: shell Obsidian fiel, code-led (Operate): la ambición vive en este contrato. seed: none (user-pinned direction, no roll).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
