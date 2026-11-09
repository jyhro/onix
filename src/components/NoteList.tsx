"use client";

import { cn } from "cn";
import { useEffect, useRef, useState } from "react";

interface NoteListProps {
  notes: string[];
  selected?: string | null;
  onSelect?: (id: string) => void;
  rowHeight?: number;
  overscan?: number;
}

// Virtualización por ventana: solo renderiza lo visible + overscan.
export function NoteList({
  notes,
  selected,
  onSelect,
  rowHeight = 32,
  overscan = 5,
}: NoteListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(0);
  const [height, setHeight] = useState(400);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setTop(el.scrollTop);
      setHeight(el.clientHeight || 400);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (notes.length === 0) {
    return <p className="px-3 py-4 text-sm text-muted-foreground">Sin notas</p>;
  }

  const start = Math.max(0, Math.floor(top / rowHeight) - overscan);
  const end = Math.min(
    notes.length,
    Math.ceil((top + height) / rowHeight) + overscan,
  );

  return (
    <div
      ref={ref}
      className="h-full overflow-y-auto"
      role="listbox"
      aria-label="Notas"
    >
      <div className="relative" style={{ height: notes.length * rowHeight }}>
        {notes.slice(start, end).map((id, i) => {
          const idx = start + i;
          return (
            <button
              key={id}
              type="button"
              role="option"
              aria-selected={selected === id}
              title={id}
              onClick={() => onSelect?.(id)}
              style={{ top: idx * rowHeight, height: rowHeight }}
              className={cn(
                "absolute right-0 left-0 truncate px-3 text-left text-sm",
                selected === id
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {id}
            </button>
          );
        })}
      </div>
    </div>
  );
}
