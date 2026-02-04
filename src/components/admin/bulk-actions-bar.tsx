"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/toaster";

interface BulkActionsBarProps {
  selectedIds: string[];
  onClear: () => void;
  onRefresh: () => void;
}

const STATUSES = ["NEW", "IN_REVIEW", "QUOTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED"];

export function BulkActionsBar({ selectedIds, onClear, onRefresh }: BulkActionsBarProps) {
  const t = useTranslations();
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  if (selectedIds.length === 0) return null;

  async function changeStatus(newStatus: string) {
    setShowStatusMenu(false);
    const promises = selectedIds.map((id) =>
      fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
    );
    await Promise.all(promises);
    toast(t("admin.toast.statusUpdated"), "success");
    onClear();
    onRefresh();
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-notion-text text-white rounded-lg shadow-xl px-4 py-2.5 flex items-center gap-3 text-sm animate-fade-up">
      <span className="font-medium">
        {t("admin.bulkActions.selected", { count: selectedIds.length })}
      </span>
      <div className="w-px h-4 bg-white/20" />

      {/* Change Status */}
      <div className="relative">
        <button
          onClick={() => setShowStatusMenu(!showStatusMenu)}
          className="px-3 py-1 rounded-md hover:bg-white/10 transition-colors font-medium"
        >
          {t("admin.bulkActions.changeStatus")}
        </button>
        {showStatusMenu && (
          <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-notion-border py-1 min-w-[160px]">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => changeStatus(s)}
                className="w-full text-left px-3 py-1.5 text-sm text-notion-text hover:bg-notion-bg-hover transition-colors"
              >
                {t(`application.status.${s}`)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-white/20" />
      <button
        onClick={onClear}
        className="px-3 py-1 rounded-md hover:bg-white/10 transition-colors"
      >
        {t("common.cancel")}
      </button>
    </div>
  );
}
