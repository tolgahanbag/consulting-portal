"use client";

import { useTranslations } from "next-intl";
import type { Application } from "@/types/admin";

interface TabOverviewProps {
  app: Application;
}

const STATUS_FLOW = ["NEW", "IN_REVIEW", "QUOTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED"];

export function TabOverview({ app }: TabOverviewProps) {
  const t = useTranslations();
  const currentIdx = STATUS_FLOW.indexOf(app.status);

  return (
    <div className="space-y-6">
      {/* Application Info */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display font-semibold text-navy-900 mb-4">
          {t("admin.overview.applicationInfo")}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-navy-400 uppercase tracking-wide mb-1">
              {t("admin.overview.companyName")}
            </p>
            <p className="text-sm font-medium text-navy-900">{app.companyName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-navy-400 uppercase tracking-wide mb-1">
              {t("admin.overview.companyType")}
            </p>
            <p className="text-sm font-medium text-navy-900">{app.companyType}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-navy-400 uppercase tracking-wide mb-1">
              {t("admin.overview.contactPerson")}
            </p>
            <p className="text-sm font-medium text-navy-900">
              {app.fullName} &middot; {app.email} &middot; {app.phone}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-navy-400 uppercase tracking-wide mb-1">
              {t("admin.overview.submittedOn")}
            </p>
            <p className="text-sm font-medium text-navy-900">
              {new Date(app.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {app.description && (
          <div className="mt-4 pt-4 border-t border-navy-100/30">
            <p className="text-xs font-medium text-navy-400 uppercase tracking-wide mb-1">
              {t("common.description")}
            </p>
            <p className="text-sm text-navy-600">{app.description}</p>
          </div>
        )}
      </div>

      {/* Status Flow */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display font-semibold text-navy-900 mb-4">
          {t("admin.overview.statusFlow")}
        </h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STATUS_FLOW.map((status, idx) => (
            <div key={status} className="flex items-center gap-1 flex-shrink-0">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  idx <= currentIdx
                    ? idx === currentIdx
                      ? "bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 shadow-lg"
                      : "bg-navy-900 text-white"
                    : "bg-navy-50 text-navy-400"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    idx < currentIdx
                      ? "bg-white/20"
                      : idx === currentIdx
                      ? "bg-navy-950/10"
                      : "bg-navy-200/50"
                  }`}
                >
                  {idx < currentIdx ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </span>
                {t(`application.status.${status}`)}
              </div>
              {idx < STATUS_FLOW.length - 1 && (
                <svg className="w-4 h-4 text-navy-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
