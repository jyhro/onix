<!-- codebase-memory-mcp:start -->
# Codebase Memory

## Codebase Knowledge Graph (codebase-memory-mcp)

This project uses codebase-memory-mcp to maintain a knowledge graph of the codebase.
ALWAYS prefer MCP graph tools over grep/glob/file-search for code discovery.

### Priority Order
1. `search_graph` — find functions, classes, routes, variables by pattern
2. `trace_path` — trace who calls a function or what it calls
3. `get_code_snippet` — read specific function/class source code
4. `check_index_coverage` — validate candidate paths and missed ranges before claims
5. `query_graph` — run Cypher queries for complex patterns
6. `get_architecture` — high-level project summary

### Evidence tiers
- **Scout (Tier 1):** quick positive lookup with few calls and targeted source checks. Mark it provisional; do not make negative or exhaustive claims.
- **Verify (Tier 2, default):** task-directed graph evidence, relevant trace directions, exact snippets for material claims, and relevant pagination.
- After candidate paths are known in any tier, call `check_index_coverage` once with every evidence path. Add relevant scopes for negative or exhaustive claims. A clean result means no recorded gap, not proof of completeness. For partial, skipped, excluded, stale, pending, or unknown coverage, read/grep the reported ranges or scope before relying on graph results.

### When to fall back to grep/glob
- Searching for string literals, error messages, config values
- Searching non-code files (Dockerfiles, shell scripts, configs)
- When MCP tools return insufficient results

### Session resets and subagents
- At session start or after compaction, confirm the nearest graph project and generation with `list_projects` or `index_status`, then choose Scout, Verify, or Auditor.
- The graph project is the `list_projects` entry whose `root_path` contains your working directory; pass its `name` (or the absolute directory itself) as `project`, never a repo or folder name.
- Before spawning a subagent, query the graph and coverage in the parent. Pass the tier, project, generation/freshness, bounded scope, queries and pagination state, qualified symbols, paths, call-chain findings, coverage evidence with ranges/reasons, source fallback already performed, and unresolved questions in the delegated task context.
- Do not assume subagents inherit MCP access or the parent conversation. If a child lacks MCP tools, it must not call or claim MCP access. It should use the supplied evidence and read/grep exact source, especially every reported missed-coverage range.
<!-- codebase-memory-mcp:end -->

# Ónix — notas del proyecto

Clon web de Obsidian (Next.js). Vault = archivos `.md` en disco,
compatibles con Obsidian real. Spec: `docs/superpowers/specs/2026-11-09-onix-design.md`.
Plan: `docs/superpowers/plans/2026-11-09-onix-plan.md`.

## Skills en uso

- `codebase-memory`: descubrimiento de código vía grafo (bloque de arriba).
- `impeccable`: guía el diseño UI (PRODUCT.md, DESIGN.md, superficie vault); mundo fijado: shadcn neutral dark-first.
- `test-driven-development`: todo lo de `src/lib/` nace con su test (`vitest`).
- `systematic-debugging`: ante un bug, diagnosticar antes de proponer fix.
- `verification-before-completion`: `npm run build` + smoke HTTP antes de declarar done.

## Reglas del vault (no negociables)

- `src/lib/vault.ts` es la única capa que toca notas; recibe el root del workspace (`VAULT_ROOT/workspaces/<id>`).
- Usuarios/roles/grants en JSON del sistema (`data/system/`); sesiones JWT en cookie httpOnly.
- Sin sesión → 401; sin grant → 403.
- Toda ruta se confina a su root; `..` y absolutos → rechazo.
- Límite por nota: 1 MB. Título vacío → 400.
- Nunca romper el markdown en disco; sin DB para notas.

## UI

- TailwindCSS + shadcn, tema base neutral. Sin CSS suelto salvo `src/themes/*.css`.
- Presets de color (neutral, stone, zinc, slate) vía `data-theme` + `next-themes`, en Ajustes → Apariencia → Color, persistidos en localStorage.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
