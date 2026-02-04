"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";

interface Crumb {
  label: string;
  href?: string;
}

export function AdminBreadcrumbs() {
  const t = useTranslations();
  const pathname = usePathname();
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "");
  const segments = pathWithoutLocale.split("/").filter(Boolean);

  const crumbs: Crumb[] = [];

  if (segments[0] === "admin") {
    crumbs.push({ label: t("admin.title"), href: "/admin" });

    if (segments[1] === "documents") {
      crumbs.push({ label: t("admin.sidebar.documents") });
    } else if (segments[1] === "applications" && segments[2]) {
      crumbs.push({ label: t("admin.sidebar.applications"), href: "/admin" });
      crumbs.push({ label: t("application.details") });
    }
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-sm mb-6">
      {crumbs.map((crumb, idx) => (
        <span key={idx} className="flex items-center gap-1">
          {idx > 0 && (
            <span className="text-notion-text-secondary mx-0.5">/</span>
          )}
          {crumb.href && idx < crumbs.length - 1 ? (
            <Link
              href={crumb.href}
              className="text-notion-text-secondary hover:text-notion-text transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-notion-text font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
