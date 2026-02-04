"use client";

import { useEffect, useCallback } from "react";
import { CommandPalette } from "./command-palette";

interface CommandPaletteProviderProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPaletteProvider({ children, open, onOpenChange }: CommandPaletteProviderProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    },
    [open, onOpenChange]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      {children}
      <CommandPalette open={open} onOpenChange={onOpenChange} />
    </>
  );
}
