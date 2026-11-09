import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";

// Tema CodeMirror del mundo Obsidian (solo dark; el claro usa "light").
// Construido con las primitivas de CodeMirror 6 (el paquete instalado no
// exporta createTheme).
const obsidianHighlight = HighlightStyle.define([
  { tag: t.comment, color: "#7a7a7a" },
  { tag: t.heading1, color: "#a882ff", fontWeight: "600" },
  { tag: [t.heading2, t.heading3], color: "#dcddde", fontWeight: "600" },
  { tag: [t.url, t.link], color: "#a882ff" },
  { tag: [t.meta, t.quote], color: "#999999" },
  { tag: t.strong, fontWeight: "700" },
]);

export const obsidianEditorTheme = [
  EditorView.theme(
    {
      "&": { backgroundColor: "#1e1e1e", color: "#dcddde" },
      ".cm-content": { caretColor: "#a882ff" },
      ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#a882ff" },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
        backgroundColor: "#a882ff33",
      },
      ".cm-gutters": {
        backgroundColor: "#1e1e1e",
        color: "#6a6a6a",
        border: "none",
      },
      ".cm-activeLine": { backgroundColor: "#2a2a2a59" },
    },
    { dark: true },
  ),
  syntaxHighlighting(obsidianHighlight),
];
