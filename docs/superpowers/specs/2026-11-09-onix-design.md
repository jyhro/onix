# Ónix — Design (v1)

**Fecha:** 2026-11-09 | **Estado:** aprobado por el dueño

## Intent

Un clon web mínimo de Obsidian en Next.js que dure: vertical slice real
(listar/crear/editar/previsualizar notas, `[[enlaces]]`, búsqueda),
desplegado en Dokploy desde el día uno, sobre archivos `.md` en disco
compatibles con Obsidian real. La v1 define estructura y alcance; el
resto son módulos declarados pero vacíos.

## Goals (v1)

1. Vaults en filesystem: `VAULT_ROOT/workspaces/<id>/`, un `.md` por nota, frontmatter YAML.
2. CRUD completo vía UI y vía API por workspace.
3. Editor CodeMirror 6 + preview GFM lado a lado.
4. `[[wikilinks]]` navegables; enlace roto propone crear la nota.
5. Búsqueda instantánea por nombre y contenido (miles de notas).
6. Multi-usuario: owner/admin con control total, usuarios con permisos por workspace otorgados por el admin; panel admin.
7. UI con TailwindCSS + shadcn, tema base neutral; página Ajustes → Apariencia → Color con presets seleccionables (neutral + más).
8. `Dockerfile` + compose + deploy Dokploy + HTTPS funcionando día uno.

## Skills del proyecto

- `codebase-memory`: descubrimiento de código vía grafo (ver `AGENTS.md`).
- `test-driven-development`: todo lo de `lib/` nace con su test.
- `systematic-debugging`: ante un bug, antes de proponer fix.
- `verification-before-completion`: verificar build + smoke antes de declarar done.

## Non-goals (v1)

Graph view, canvas, plugins, sync/LiveSync, móvil, colaboración,
WYSIWYG, Authentik (v2), backups programados (se hacen en UI Dokploy).

## Anti-goals

- Nada que rompa el markdown en disco (el vault debe abrir en Obsidian real).
- Nada que dependa de una DB propietaria.
- Nada expuesto sin auth.

## Constraints

- Next.js App Router + TypeScript estricto.
- Versiones fijadas (npm, 2026-11-09): `next@16.4.5`, `react@19.3.1`, `typescript@7.0.2`, `tailwindcss@4.3.5`, `shadcn@4.23.0` (CLI), `@uiw/react-codemirror@4.25.12`, `react-markdown@10.1.0`, `remark-gfm@4.0.1`, `gray-matter@4.0.3`, `next-themes@0.4.6`, `vitest@5.1.0`. El ejecutor usa estas exactas.
- Vault 100% archivos; `src/lib/vault.ts` es la única capa que toca notas (recibe el root del workspace).
- Usuarios/roles/grants en JSON del sistema (`data/system/`); sesiones JWT en cookie httpOnly. Sin DB.
- Auth siempre exigida; sin grant sobre un workspace → 403. Sin secreto de sesión → todo 401.
- Todo input con ruta se confina a su root (anti path-traversal).
- Límite de tamaño por nota: 1 MB.
- UI: TailwindCSS + shadcn, tema base neutral; presets extra vía variables CSS (`data-theme`), persistidos en localStorage.

## Approaches (considerados)

- **A. Vertical slice desplegado día uno (elegido).** Estructura real +
  alcance cerrado + pipeline vivo. Lo que se despliega es lo que sobrevive.
- **B. Docs primero, cero código.** Más orden en papel, riesgo de
  sobrediseñar sin validar nada.
- **C. Spike de editor.** Útil para comparar, pero se bota todo.

## Decidido

- Editor: CodeMirror 6 (`@uiw/react-codemirror`), preview `react-markdown` + `remark-gfm`.
- Tests: `vitest` para `lib/`; `next build` + smoke HTTP como verificación de UI/API.
- Estructura: `src/app/`, `src/components/`, `src/lib/`, `vault/` (dev).

## Átomos del sistema (v1 atomizada)

Backend (`src/lib/` + rutas API; cada átomo con su test):
- `vault-fs`: CRUD `.md` confinado a un root (`list/read/write/delete`).
- `links`: parse/resolve de `[[wikilinks]]` (puro, sin IO).
- `search`: índice en memoria por workspace + snippet.
- `system-store`: `users.json` (hash bcrypt), `workspaces.json`, `grants.json`; permisos efectivos.
- `session`: JWT en cookie httpOnly (`jose`); setup del primer owner.
- `api-notes`: CRUD por workspace (`/api/w/[ws]/notes…`); `api-search`, `api-admin` (usuarios/grants).
- `middleware`: exige sesión; sin secreto o sin grant → 401/403.

Frontend (`src/components/`, `src/app/`; verificación = build + smoke):
- `AppShell`: 3 paneles colapsables. `NoteList` virtualizada + `SearchBox` (⌘K).
- `NoteEditor` (CodeMirror, guardado con debounce). `MarkdownPreview` (GFM + `WikiLink`).
- `ThemeSwitcher` + página Ajustes → Apariencia → Color (`src/themes/*.css`).
- `LoginPage`, `SetupPage` (primer owner), `AdminUsers`, `AdminWorkspaces`.

## Abierto al builder

Versión exacta de Next.js (usar la estable al scaffoldear), estilo visual
del layout, subdominio final (propuesta: `onix.yeiserjimenez.dev`).
