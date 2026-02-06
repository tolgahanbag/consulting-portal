"use client";

import { useState, useCallback } from "react";
import { NotionSidebar } from "@/components/admin/notion-sidebar";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { CommandPaletteProvider } from "@/components/admin/command-palette-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  const handleSearchClick = useCallback(() => {
    setPaletteOpen(true);
  }, []);

  return (
    <CommandPaletteProvider open={paletteOpen} onOpenChange={setPaletteOpen}>
      <div className="flex min-h-screen admin-shell">
        <NotionSidebar onSearchClick={handleSearchClick} />
        <div className="flex-1 lg:ml-60 pt-[72px]">
          <div className="admin-topbar sticky top-[72px] z-40">
            <div className="max-w-6xl mx-auto px-6 lg:px-10 h-12 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="admin-chip">Admin</span>
                <span className="text-xs uppercase tracking-[0.18em] text-notion-text-secondary">
                  Operations Workspace
                </span>
              </div>
              <button
                onClick={handleSearchClick}
                className="text-xs font-medium px-3 py-1.5 rounded-md border border-notion-border text-notion-text-secondary hover:text-notion-text hover:bg-notion-bg-hover transition-colors"
              >
                Command Palette ⌘K
              </button>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
            <AdminBreadcrumbs />
            {children}
          </div>
        </div>
      </div>
    </CommandPaletteProvider>
  );
}
