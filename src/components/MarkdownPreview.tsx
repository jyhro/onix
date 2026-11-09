"use client";

import { useMemo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { resolveLink } from "@/lib/links";
import { WikiLink } from "./WikiLink";

const WIKILINK_PREFIX = "#wikilink/";

// Mismo patrón que parseLinks (Task 3): `[[x]]` y `[[x|etiqueta]]`.
const WIKILINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

// mdast mínimo (sin traer el paquete de tipos): solo lo que toca el plugin.
interface MdNode {
  type: string;
  value?: string;
  url?: string;
  children?: MdNode[];
}

function splitText(value: string): MdNode[] {
  const out: MdNode[] = [];
  let last = 0;
  WIKILINK_RE.lastIndex = 0;
  let m: RegExpExecArray | null = WIKILINK_RE.exec(value);
  while (m !== null) {
    if (m.index > last)
      out.push({ type: "text", value: value.slice(last, m.index) });
    const raw: string = m[1];
    const label = (m[2] ?? raw).trim();
    out.push({
      type: "link",
      url: `${WIKILINK_PREFIX}${encodeURIComponent(raw)}`,
      children: [{ type: "text", value: label }],
    });
    last = m.index + m[0].length;
    m = WIKILINK_RE.exec(value);
  }
  if (last < value.length) out.push({ type: "text", value: value.slice(last) });
  return out.length > 0 ? out : [{ type: "text", value }];
}

// Plugin remark propio: `[[x]]` → nodo link con URL `wikilink:` que el
// `components.a` de abajo convierte en <WikiLink>. Solo toca nodos `text`
// (el código inline/bloques nunca son `text`), GFM lo maneja remark-gfm.
function remarkWikilink() {
  return (tree: MdNode) => {
    const visitNode = (node: MdNode) => {
      const kids: MdNode[] | undefined = node.children;
      if (!Array.isArray(kids)) return;
      const next: MdNode[] = [];
      for (const child of kids) {
        if (child?.type === "text" && typeof child.value === "string") {
          next.push(...splitText(child.value));
        } else {
          visitNode(child);
          next.push(child);
        }
      }
      node.children = next;
    };
    visitNode(tree);
  };
}

function decodeSeg(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function childText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children))
    return children.filter((c) => typeof c === "string").join("");
  return "";
}

interface MarkdownPreviewProps {
  ws: string;
  content: string;
  /** Ids de notas con grant (GET /api/w/[ws]/notes); se comparan con trim. */
  ids: string[];
  canWrite: boolean;
}

// Preview GFM: renderiza `content` y convierte `[[x]]` en <WikiLink>.
export function MarkdownPreview({
  ws,
  content,
  ids,
  canWrite,
}: MarkdownPreviewProps) {
  const trimmed = useMemo(() => ids.map((i) => i.trim()), [ids]);

  const components: Components = useMemo(
    () => ({
      a: ({ href, children }) => {
        if (href?.startsWith(WIKILINK_PREFIX)) {
          const raw = decodeSeg(href.slice(WIKILINK_PREFIX.length));
          const label = childText(children) || undefined;
          // resolveLink compara exacto: se le pasa la lista ya trimeada y el
          // target trimeado (tolera `[[ foo ]]`, caso de Task 3).
          const { exists } = resolveLink(raw.trim(), trimmed);
          return (
            <WikiLink
              ws={ws}
              target={raw}
              label={label}
              exists={exists}
              canWrite={canWrite}
            />
          );
        }
        return (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4"
          >
            {children}
          </a>
        );
      },
      h1: ({ children }) => (
        <h1 className="mb-2 text-xl font-semibold">{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="mb-2 text-lg font-semibold">{children}</h2>
      ),
      h3: ({ children }) => <h3 className="mb-1 font-semibold">{children}</h3>,
      p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
      ul: ({ children }) => (
        <ul className="my-2 list-disc space-y-1 pl-6">{children}</ul>
      ),
      ol: ({ children }) => (
        <ol className="my-2 list-decimal space-y-1 pl-6">{children}</ol>
      ),
      code: ({ children }) => (
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
          {children}
        </code>
      ),
      pre: ({ children }) => (
        <pre className="my-2 overflow-auto rounded bg-muted p-3 text-sm">
          {children}
        </pre>
      ),
      table: ({ children }) => (
        <table className="my-2 w-full border-collapse text-sm">
          {children}
        </table>
      ),
      th: ({ children }) => (
        <th className="border border-border px-2 py-1 text-left font-semibold">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="border border-border px-2 py-1">{children}</td>
      ),
    }),
    [ws, trimmed, canWrite],
  );

  return (
    <div className="flex h-full flex-col" data-testid="markdown-preview">
      <div className="border-b border-border px-4 py-2">
        <span className="text-sm font-medium text-muted-foreground">
          Vista previa
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-4 py-3 text-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkWikilink]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
