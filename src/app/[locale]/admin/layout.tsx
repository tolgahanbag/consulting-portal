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
      <div className="flex min-h-screen bg-white">
        <NotionSidebar onSearchClick={handleSearchClick} />
        <div className="flex-1 lg:ml-60 pt-[72px]">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
            <AdminBreadcrumbs />
            {children}
          </div>
        </div>
      </div>
    </CommandPaletteProvider>
  );
}
