# Design — Ónix

Mundo heredado y fijado por el dueño: **shadcn, tema neutral, dark-first**.
No se reemplaza; las superficies lo heredan. Modo de la superficie principal: **Operate**.

## Estrategia de color

Restrained: neutrales del sistema + un acento para acciones y `[[enlaces]].
Dark-first (escritura nocturna, como Obsidian); light disponible en el mismo preset.

## Tipografía

Sistema de la plataforma para UI (rápido, nativo); mono del sistema para el editor.
Sin display serif: es una herramienta, no una portada.

## Componentes

shadcn/Radix sin reestilizar salvo tokens. Virtualización en listas largas
(sidebar). Densidad cómoda, paneles colapsables al estilo Obsidian.

## Tokens

Variables CSS shadcn por preset en `src/themes/*.css` (`neutral` base + `stone`,
`zinc`, `slate`), conmutadas con `data-theme` vía `next-themes`, persistidas
en localStorage. Sin CSS suelto fuera de `src/themes/`.
