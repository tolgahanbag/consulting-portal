"use client";

import { useTranslations } from "next-intl";
import { getNotionStatusColor } from "@/lib/status-utils";
import type { Application } from "@/types/admin";

interface TabOverviewProps {
  app: Application;
}

const STATUS_FLOW = ["NEW", "IN_REVIEW", "QUOTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED"];

export function TabOverview({ app }: TabOverviewProps) {
  const t = useTranslations();
  const currentIdx = STATUS_FLOW.indexOf(app.status);

  const properties = [
    { label: t("admin.overview.companyName"), value: app.companyName },
    { label: t("admin.overview.companyType"), value: app.companyType },
    { label: t("admin.overview.contactPerson"), value: `${app.fullName} \u00B7 ${app.email} \u00B7 ${app.phone}` },
    { label: t("admin.overview.submittedOn"), value: new Date(app.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      {/* Application Properties */}
      <div className="notion-card">
        <h3 className="text-sm font-semibold text-notion-text mb-4">
          {t("admin.overview.applicationInfo")}
        </h3>
        <div className="divide-y divide-notion-border">
          {properties.map((prop, idx) => (
            <div key={idx} className="flex py-2 text-sm">
              <span className="w-40 flex-shrink-0 text-notion-text-secondary">{prop.label}</span>
              <span className="text-notion-text">{prop.value}</span>
            </div>
          ))}
          {app.description && (
            <div className="flex py-2 text-sm">
              <span className="w-40 flex-shrink-0 text-notion-text-secondary">{t("common.description")}</span>
              <span className="text-notion-text">{app.description}</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Flow */}
      <div className="notion-card">
        <h3 className="text-sm font-semibold text-notion-text mb-4">
          {t("admin.overview.statusFlow")}
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STATUS_FLOW.map((status, idx) => {
            const sc = getNotionStatusColor(status);
            const isPast = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <div key={status} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                    isCurrent
                      ? `${sc.bg} ${sc.text}`
                      : isPast
                      ? "bg-notion-bg-secondary text-notion-text"
                      : "bg-notion-bg-secondary text-notion-text-secondary"
                  }`}
                >
                  {isPast ? (
                    <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className={`w-2 h-2 rounded-full ${isCurrent ? sc.dot : "bg-notion-border"}`} />
                  )}
                  {t(`application.status.${status}`)}
                </div>
                {idx < STATUS_FLOW.length - 1 && (
                  <svg className="w-3 h-3 text-notion-text-secondary/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
