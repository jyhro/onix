---
name: Ónix
description: Taller personal de notas Obsidian en la web.
colors:
  violet-obsidian: "#a882ff"
  graphite-canvas: "#1e1e1e"
  graphite-surface: "#242424"
  graphite-popover: "#262626"
  graphite-sidebar: "#1a1a1a"
  graphite-ribbon: "#161616"
  graphite-border: "#333333"
  graphite-text: "#dcddde"
  graphite-muted: "#999999"
  graphite-selection: "#37333f"
  state-danger: "#e06c75"
  light-canvas: "#ffffff"
  light-text: "#2e3338"
  violet-light: "#7c3aed"
typography:
  body:
    fontFamily: "Geist, Geist Fallback, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  title:
    fontFamily: "Geist, Geist Fallback, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "28px"
  label:
    fontFamily: "Geist, Geist Fallback, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
  code:
    fontFamily: "Geist Mono, Geist Mono Fallback, monospace"
    fontSize: "14px"
    fontWeight: 400
rounded:
  base: "6px"
  button: "8px"
  input: "12px"
  panel: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.violet-obsidian}"
    textColor: "{colors.graphite-canvas}"
    rounded: "{rounded.input}"
    padding: "10px 12px"
    typography: "{typography.label}"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.graphite-text}"
    rounded: "{rounded.base}"
    padding: "8px 10px"
    height: "32px"
    typography: "{typography.label}"
  icon-rail:
    backgroundColor: "{colors.graphite-ribbon}"
    textColor: "{colors.graphite-muted}"
    width: "48px"
  active-note:
    backgroundColor: "{colors.graphite-selection}"
    textColor: "{colors.graphite-text}"
    height: "32px"
  status-bar:
    backgroundColor: "{colors.graphite-sidebar}"
    textColor: "{colors.graphite-muted}"
    height: "24px"
---

# Design System: Ónix

## Overview

**Creative North Star: “Taller personal.”**

Ónix es un espacio de escritura y pensamiento en web, siguiendo los patrones reconocibles de Obsidian: árbol del vault, pestañas, editor Markdown, preview y `[[wikilinks]]`. La interfaz sirve al trabajo diario y mantiene el archivo Markdown como fuente de verdad. Su voz es discreta y directa: la navegación siempre está donde se espera y los controles no compiten con las notas.

El modo oscuro es el principal para sesiones largas de escritura; el modo claro conserva la misma estructura. El violeta identifica acciones, selección, foco y navegación. La profundidad se expresa con superficies tonales y bordes finos, no con sombras decorativas.

**Key Characteristics:**
- Fiel a la gramática de navegación de Obsidian.
- Riel, árbol, pestañas, área de trabajo y estado claramente separados.
- Geist en UI; Geist Mono para editor y código.
- Violeta para acción, foco y enlaces.

## Colors

Grafito de baja distracción con un acento violeta funcional y estados semánticos.

### Primary
- **Violeta Obsidian** (`colors.violet-obsidian`): acciones primarias, foco, selección y enlaces internos.

### Tertiary
- **Error semántico** (`colors.state-danger`): errores de autenticación y guardado; nunca como decoración.

### Neutral
- **Canvas grafito** (`colors.graphite-canvas`): superficie principal de escritura.
- **Superficie grafito** (`colors.graphite-surface`, `colors.graphite-popover`): paneles y superficies de trabajo.
- **Sidebar grafito** (`colors.graphite-sidebar`): árbol y barra de estado.
- **Ribbon carbón** (`colors.graphite-ribbon`): riel de iconos.
- **Borde grafito** (`colors.graphite-border`): separación de paneles, tabs y controles.
- **Texto de nota** (`colors.graphite-text`): texto primario.
- **Texto secundario** (`colors.graphite-muted`): metadatos e instrucciones.
- **Selección violeta oscura** (`colors.graphite-selection`): hover y nota activa.
- **Canvas claro / texto claro** (`colors.light-canvas`, `colors.light-text`): preset claro.
- **Violeta claro** (`colors.violet-light`): acciones y foco en el preset claro.

### Named Rules
**The Violet Has a Job Rule.** El violeta significa acción, foco o navegación; no se dispersa como adorno.

## Typography

**Display Font:** Geist (con Geist Fallback)
**Body Font:** Geist (con Geist Fallback)
**Label/Mono Font:** Geist Mono en editor y código.

**Character:** Utilitaria y neutra. La tipografía acompaña la lectura de notas y permite escanear controles sin imponer una voz editorial ajena al contenido.

### Hierarchy
- **Title** (600, 20px, 28px): títulos de página y nota.
- **Body** (400, 16px, 24px): lectura general y contenido.
- **Label** (500, 14px, 20px): controles, navegación y metadatos.
- **Code** (400, 14px): editor y fragmentos de código.

## Layout

Shell con riel fijo de 48px, árbol lateral de 256px, área central flexible y status bar de 24px. El encabezado de pestañas ocupa 36px. En escritorio, editor y preview comparten el área central; en anchos menores se apilan verticalmente. La lista de notas virtualiza filas de 32px con overscan de cinco filas. El riel agrupa archivos, búsqueda, ajustes y administración; los workspaces se cambian desde la cabecera del árbol.

**The Workspace First Rule.** Al entrar, el usuario ve su workspace y notas; configuración y administración no compiten con la escritura.

## Elevation & Depth

Sistema plano con capas tonales. Canvas, sidebar, ribbon y paneles se separan con color de superficie y bordes finos. Las sombras no forman parte del shell de trabajo ni sustituyen a una jerarquía clara.

## Shapes

Geometría compacta de herramienta. El radio base es de 6px; botones, campos y pestañas usan esquinas discretas de 8–12px; tarjetas puntuales pueden llegar a 16px. Los bordes finos separan áreas sin encerrar cada elemento en una tarjeta.

## Components

### Buttons
- **Shape:** compacto, con esquinas de 8–12px.
- **Primary:** Violeta Obsidian, texto de alto contraste y altura de control compacta.
- **Hover / Focus:** cambio tonal y anillo de foco visible.
- **Ghost:** transparente en reposo; hover sobre superficie muted.

### Inputs / Fields
- **Style:** transparentes o sobre superficie, borde fino y esquinas compactas.
- **Focus:** borde, caret y anillo violetas.
- **Error / Disabled:** error semántico; disabled conserva legibilidad y baja énfasis.

### Navigation
- **Riel:** Lucide de trazo fino, 48px, botones de icono y tooltips.
- **Tree:** filas virtualizadas de 32px, truncado de nombres y selección tonal.
- **Tabs:** tab activa con fondo de canvas, título truncable y acción de cierre.
- **Status bar:** 24px; workspace, cantidad de notas y estado de guardado.

### Editor & Preview
CodeMirror conserva Markdown como fuente; la preview GFM ocupa el panel paralelo en escritorio y se apila en pantalla estrecha. Los `[[wikilinks]]` resueltos usan el acento; los enlaces pendientes se distinguen como acción de creación.

### Cards / Containers
Uso puntual en autenticación y preferencias. Fondo de superficie y borde; evitar anidar tarjetas o usar tarjetas como estructura de página.

## Do's and Don'ts

### Do:
- **Do** conservar el orden Obsidian: archivos → nota → editor/preview.
- **Do** usar el violeta para selección, foco, enlaces y acción primaria.
- **Do** mantener visible el estado de guardado y distinguir solo lectura.
- **Do** preservar Markdown, frontmatter y `[[wikilinks]]` al guardar.
- **Do** dar foco visible a riel, pestañas y campos.

### Don't:
- **Don't** convertir el shell de escritura en un dashboard de widgets.
- **Don't** usar sombras para separar paneles cuando las superficies tonales ya lo hacen.
- **Don't** colorear texto por adorno ni comunicar estados solo mediante color.
- **Don't** ocultar el árbol del vault tras modales o navegación poco familiar.
