"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";

interface NotionSidebarProps {
  onSearchClick?: () => void;
}

const navItems = [
  {
    key: "dashboard",
    href: "/admin",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    key: "applications",
    href: "/admin",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    key: "kanban",
    href: "/admin?view=board",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    key: "documents",
    href: "/admin/documents",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    key: "users",
    href: "/admin/users",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    key: "reports",
    href: "/admin/reports",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    key: "notifications",
    href: "/admin/notifications",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    key: "translations",
    href: "/admin/translations",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
  },
  {
    key: "settings",
    href: "/admin/settings",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: "auditLogs",
    href: "/admin/audit-logs",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
];

export function NotionSidebar({ onSearchClick }: NotionSidebarProps) {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("notion-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("notion-sidebar-collapsed", String(next));
  }

  function isActive(item: typeof navItems[0]) {
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "");
    if (item.key === "dashboard") {
      return pathWithoutLocale === "/admin";
    }
    if (item.key === "applications") {
      return pathWithoutLocale === "/admin" || pathWithoutLocale.startsWith("/admin/applications");
    }
    if (item.key === "kanban") {
      return pathWithoutLocale === "/admin" && typeof window !== "undefined" && window.location.search.includes("view=board");
    }
    if (item.key === "documents") {
      return pathWithoutLocale.startsWith("/admin/documents");
    }
    if (item.key === "users") {
      return pathWithoutLocale.startsWith("/admin/users");
    }
    if (item.key === "notifications") {
      return pathWithoutLocale.startsWith("/admin/notifications");
    }
    if (item.key === "reports") {
      return pathWithoutLocale.startsWith("/admin/reports");
    }
    if (item.key === "translations") {
      return pathWithoutLocale.startsWith("/admin/translations");
    }
    if (item.key === "settings") {
      return pathWithoutLocale.startsWith("/admin/settings");
    }
    if (item.key === "auditLogs") {
      return pathWithoutLocale.startsWith("/admin/audit-logs");
    }
    return false;
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-notion-sidebar">
      {/* Workspace header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-notion-border">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-white">E</span>
            </div>
            <span className="text-sm font-semibold text-notion-text truncate">
              EstonTurk
            </span>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className="p-1 rounded hover:bg-notion-bg-hover text-notion-text-secondary transition-colors flex-shrink-0"
          title={collapsed ? "Expand" : "Collapse"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      {/* Search button */}
      <div className="px-2 pt-2">
        <button
          onClick={onSearchClick}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-notion-text-secondary hover:bg-notion-bg-hover transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {!collapsed && (
            <>
              <span>{t("sidebar.search")}</span>
              <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-notion-bg-hover text-notion-text-secondary border border-notion-border">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 pt-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`notion-sidebar-item ${active ? "active" : ""} ${collapsed ? "justify-center px-0" : ""}`}
            >
              <span className={`flex-shrink-0 ${active ? "text-notion-text" : "text-notion-text-secondary"}`}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className="truncate">{t(`sidebar.${item.key}`)}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse indicator for collapsed state */}
      {collapsed && (
        <div className="px-2 pb-3">
          <div className="w-6 h-0.5 bg-notion-border rounded mx-auto" />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-[18px] left-4 z-[55] p-2 rounded-md bg-white border border-notion-border text-notion-text-secondary hover:text-notion-text transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[58]">
          <div className="absolute inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-60 shadow-lg animate-slide-in-right">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 h-screen border-r border-notion-border z-[45] pt-[72px] transition-all duration-200 ${
          collapsed ? "w-12" : "w-60"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
