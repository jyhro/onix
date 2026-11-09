import { describe, expect, it } from "vitest";
import { resolveEditorTheme } from "./editorTheme";

function el(theme?: string, dark = false) {
  return {
    classList: { contains: (c: string) => (c === "dark" ? dark : false) },
    dataset: theme === undefined ? {} : { theme },
  };
}

describe("resolveEditorTheme", () => {
  it("obsidian es oscuro aunque no haya clase dark", () => {
    expect(resolveEditorTheme(el("obsidian"))).toBe("dark");
  });
  it("obsidian-claro es claro aunque haya clase dark residual", () => {
    expect(resolveEditorTheme(el("obsidian-claro", true))).toBe("light");
  });
  it("sin preset cae a oscuro (default del producto)", () => {
    expect(resolveEditorTheme(el(undefined))).toBe("dark");
  });
});
