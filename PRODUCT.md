# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: Next.js App Router + TypeScript (el dueño pidió Next.js, Tailwind y shadcn; versiones fijadas en la spec). Deploy en Dokploy con Docker.

## Users

- **Owner/admin:** controla todo (usuarios, permisos, workspaces).
- **Usuarios limitados:** ven y editan solo los workspaces que el admin les permite.
- Un solo producto para ambos roles; el admin suma el panel de administración.

## Product Purpose

Ónix es el clon web de Obsidian del homelab: app principal de notas (no captura ocasional) para usar en vez de Obsidian desktop. Vaults en `.md` compatibles con Obsidian real. Éxito = el dueño vive en Ónix a diario sin extrañar el desktop.

## Positioning

Lo que un clon genérico no puede copiar: vaults en archivos `.md` en su propio servidor (Dokploy), multi-usuario con workspaces por permisos, y fidelidad Obsidian (atajos, `[[enlaces]]`, el fuente manda).

## Operating Context

- Uso diario, sesiones largas de escritura; miles de notas por workspace.
- Servidor casero (Dokploy + túnel Cloudflare); red local y remota.
- Idioma UI: español (propuesto, sin confirmar).

## Capabilities and Constraints

- CRUD markdown, preview GFM, `[[wikilinks]]`, búsqueda instantánea, multi-usuario por roles, workspaces con permisos, panel admin.
- Sin DB propietaria para notas (archivos); usuarios/roles/grants en JSON del sistema + sesiones JWT.
- Auth siempre exigida; admin gestiona accesos.
- Decisiones abiertas: subdominio final (propuesta `onix.yeiserjimenez.dev`), proveedor Authentik en v2 o nunca.

## Brand Commitments

Nombre Ónix. Mundo visual: clon fiel de Obsidian (grafito oscuro, acento morado, riel/pestañas/status bar) — reemplaza al shadcn neutral por decisión del dueño. Sin claims inventados.

## Evidence on Hand

Sin contenido real aún; el vault inicial se poblará con notas de demostración sintéticas marcadas como tales. No fabricar testimonios ni métricas.

## Product Principles

1. El archivo `.md` manda; la UI nunca lo reescribe por su cuenta.
2. Multi-usuario con permisos explícitos del admin; nada visible por defecto.
3. Velocidad antes que adorno: miles de notas sin lag.
4. Cero sorpresas para quien viene de Obsidian (atajos, `[[links]]`, paneles).
5. Lo desplegado vive; lo no desplegado no existe.

## Accessibility & Inclusion

Sin requisitos específicos establecidos. Base: HTML semántico, foco visible, teclado completo (heredado de shadcn/Radix).
