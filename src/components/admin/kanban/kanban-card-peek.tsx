"use client";

import { useTranslations } from "next-intl";
import { getNotionStatusColor } from "@/lib/status-utils";
import type { ApplicationListItem } from "@/types/admin";

interface KanbanCardPeekProps {
  app: ApplicationListItem;
}

export function KanbanCardPeek({ app }: KanbanCardPeekProps) {
  const t = useTranslations();
  const statusColor = getNotionStatusColor(app.status);

  return (
    <div className="absolute left-full top-0 ml-2 z-50 w-64 bg-white border border-notion-border rounded-lg shadow-lg p-3 pointer-events-none">
      <p className="text-sm font-medium text-notion-text truncate">
        {app.companyName}
      </p>
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-notion-text-secondary">{t("admin.kanban.peek.contact")}:</span>
          <span className="text-notion-text">{app.fullName}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-notion-text-secondary">{t("common.email")}:</span>
          <span className="text-notion-text truncate">{app.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-notion-text-secondary">{t("common.status")}:</span>
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${statusColor.bg} ${statusColor.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusColor.dot}`} />
            {t(`application.status.${app.status}`)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-notion-text-secondary">{t("admin.kanban.peek.documents")}:</span>
          <span className="text-notion-text">{app._count.documents}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-notion-text-secondary">{t("admin.kanban.peek.type")}:</span>
          <span className="text-notion-text">{app.companyType}</span>
        </div>
      </div>
    </div>
  );
}
