"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Application } from "@/types/admin";

interface ApplicationHeaderProps {
  app: Application;
  onStatusChange: (status: string) => void;
}

export function ApplicationHeader({ app, onStatusChange }: ApplicationHeaderProps) {
  const t = useTranslations();

  return (
    <div className="glass-card rounded-2xl p-6 mb-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-navy-400 hover:text-gold-600 transition-colors mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("common.back")}
          </Link>
          <div className="gold-line" />
          <h1 className="font-display text-2xl font-bold text-navy-900 mt-2">{app.companyName}</h1>
          <p className="text-navy-500 text-sm mt-1">
            {app.fullName} &middot; {app.email} &middot; {app.phone}
          </p>
          <p className="text-sm text-navy-400 mt-1">{app.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={app.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="border border-navy-200 rounded-xl px-3 py-2 text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-navy-700"
          >
            {["NEW", "IN_REVIEW", "QUOTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED"].map((s) => (
              <option key={s} value={s}>
                {t(`application.status.${s}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
