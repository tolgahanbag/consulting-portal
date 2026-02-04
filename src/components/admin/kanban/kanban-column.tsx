"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { getNotionStatusColor } from "@/lib/status-utils";
import { KanbanCard } from "./kanban-card";
import { KanbanQuickAdd } from "./kanban-quick-add";
import type { ApplicationListItem } from "@/types/admin";

interface KanbanColumnProps {
  status: string;
  applications: ApplicationListItem[];
  onEditCard?: (id: string, data: { companyName?: string }) => void;
  showQuickAdd?: boolean;
  onAddCard?: (status: string) => void;
  onCreateCard?: (data: {
    companyName: string;
    fullName: string;
    email: string;
    phone: string;
    companyType: string;
    status: string;
  }) => void;
  onCancelAdd?: () => void;
}

export function KanbanColumn({
  status,
  applications,
  onEditCard,
  showQuickAdd,
  onAddCard,
  onCreateCard,
  onCancelAdd,
}: KanbanColumnProps) {
  const t = useTranslations();
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const statusColor = getNotionStatusColor(status);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[240px] max-w-[280px] flex-1 rounded-lg transition-colors ${
        isOver ? "bg-blue-50" : ""
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 px-2 py-2 mb-2">
        <span className={`w-2.5 h-2.5 rounded-full ${statusColor.dot}`} />
        <span className="text-xs font-medium text-notion-text uppercase tracking-wide">
          {t(`application.status.${status}`)}
        </span>
        <span className="text-xs text-notion-text-secondary ml-auto">
          {applications.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext
        items={applications.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 min-h-[100px] p-1">
          {applications.map((app) => (
            <KanbanCard key={app.id} app={app} onEdit={onEditCard} />
          ))}
        </div>
      </SortableContext>

      {/* Quick Add Form */}
      {showQuickAdd && onCreateCard && onCancelAdd && (
        <div className="p-1 mt-1">
          <KanbanQuickAdd
            status={status}
            onSave={onCreateCard}
            onCancel={onCancelAdd}
          />
        </div>
      )}

      {/* Add Card Button */}
      {!showQuickAdd && onAddCard && (
        <button
          onClick={() => onAddCard(status)}
          className="mx-1 mt-1 mb-2 py-1.5 text-xs text-notion-text-secondary hover:text-notion-text hover:bg-notion-bg-hover rounded transition-colors flex items-center justify-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t("admin.kanban.addCard")}
        </button>
      )}
    </div>
  );
}
