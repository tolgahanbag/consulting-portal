"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Command } from "cmdk";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AppResult {
  id: string;
  companyName: string;
  fullName: string;
  status: string;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const t = useTranslations();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<AppResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/applications?status=all`);
        if (res.ok) {
          const data = await res.json();
          const apps = (data.applications || []) as AppResult[];
          const filtered = apps.filter(
            (a) =>
              a.companyName.toLowerCase().includes(search.toLowerCase()) ||
              a.fullName.toLowerCase().includes(search.toLowerCase())
          );
          setResults(filtered.slice(0, 8));
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }, 200);
  }, [search]);

  if (!open) return null;

  const navItems = [
    { label: t("admin.sidebar.dashboard"), href: "/admin" },
    { label: t("admin.sidebar.applications"), href: "/admin" },
    { label: t("admin.sidebar.kanban"), href: "/admin?view=board" },
    { label: t("admin.sidebar.documents"), href: "/admin/documents" },
  ];

  function navigate(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative max-w-xl mx-auto mt-[20vh]">
        <Command
          className="bg-white rounded-xl shadow-2xl border border-notion-border overflow-hidden"
          shouldFilter={false}
        >
          <div className="flex items-center px-4 border-b border-notion-border">
            <svg className="w-4 h-4 text-notion-text-secondary mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder={t("admin.commandPalette.placeholder")}
              className="w-full py-3 text-sm bg-transparent outline-none text-notion-text placeholder:text-notion-text-secondary"
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            {!search && (
              <Command.Group heading={t("admin.commandPalette.navigation")} className="text-xs font-medium text-notion-text-secondary px-2 py-1.5">
                {navItems.map((item) => (
                  <Command.Item
                    key={item.href}
                    onSelect={() => navigate(item.href)}
                    className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-notion-text cursor-pointer hover:bg-notion-bg-hover data-[selected=true]:bg-notion-bg-hover"
                  >
                    <svg className="w-4 h-4 text-notion-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    {item.label}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {search && results.length > 0 && (
              <Command.Group heading={t("admin.commandPalette.applications")} className="text-xs font-medium text-notion-text-secondary px-2 py-1.5">
                {results.map((app) => (
                  <Command.Item
                    key={app.id}
                    onSelect={() => navigate(`/admin/applications/${app.id}`)}
                    className="flex items-center justify-between px-2 py-2 rounded-md text-sm text-notion-text cursor-pointer hover:bg-notion-bg-hover data-[selected=true]:bg-notion-bg-hover"
                  >
                    <div>
                      <span className="font-medium">{app.companyName}</span>
                      <span className="text-notion-text-secondary ml-2">{app.fullName}</span>
                    </div>
                    <span className="text-xs text-notion-text-secondary">{app.status}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {search && !loading && results.length === 0 && (
              <Command.Empty className="py-6 text-center text-sm text-notion-text-secondary">
                {t("admin.commandPalette.noResults")}
              </Command.Empty>
            )}

            {loading && (
              <div className="py-4 text-center text-sm text-notion-text-secondary">
                {t("common.loading")}
              </div>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
