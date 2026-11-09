"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";

interface SearchBoxProps {
  onSearch: (q: string) => void;
  placeholder?: string;
}

// Búsqueda con debounce de 150ms; ⌘K (o Ctrl+K) la enfoca.
export function SearchBox({ onSearch, placeholder }: SearchBoxProps) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const cb = useRef(onSearch);
  cb.current = onSearch;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current?.focus();
        ref.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => cb.current(value), 150);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <Input
      ref={ref}
      role="searchbox"
      aria-label="Buscar notas"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder ?? "Buscar… (⌘K)"}
    />
  );
}
