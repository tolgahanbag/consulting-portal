"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/toaster";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Workflow } from "@/types/admin";
import { WorkflowFormModal } from "./workflow-form-modal";

interface TabWorkflowProps {
  workflows: Workflow[];
  applicationId: string;
  onRefresh: () => void;
}

function getWorkflowStatusColor(status: string) {
  switch (status) {
    case "COMPLETED":
      return { dot: "bg-green-500", bg: "bg-green-50", text: "text-green-700" };
    case "IN_PROGRESS":
      return { dot: "bg-orange-500", bg: "bg-orange-50", text: "text-orange-700" };
    default:
      return { dot: "bg-gray-400", bg: "bg-gray-50", text: "text-gray-600" };
  }
}

function SortableWorkflowItem({
  wf,
  onStatusChange,
  onReply,
  replyState,
  t,
}: {
  wf: Workflow;
  onStatusChange: (id: string, status: string) => void;
  onReply: (id: string, message: string) => void;
  replyState: { activeId: string | null; texts: Record<string, string>; setActiveId: (id: string | null) => void; setTexts: React.Dispatch<React.SetStateAction<Record<string, string>>> };
  t: ReturnType<typeof useTranslations>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: wf.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sc = getWorkflowStatusColor(wf.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="notion-card group"
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-notion-text-secondary/40 hover:text-notion-text-secondary transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-notion-text">
              {wf.order}. {wf.title}
            </h4>
            <select
              value={wf.status}
              onChange={(e) => onStatusChange(wf.id, e.target.value)}
              className={`text-xs px-2 py-0.5 rounded border font-medium focus:outline-none transition-colors ${sc.bg} ${sc.text} border-transparent`}
            >
              <option value="PENDING">{t("admin.workflow.statusPending")}</option>
              <option value="IN_PROGRESS">{t("admin.workflow.statusInProgress")}</option>
              <option value="COMPLETED">{t("admin.workflow.statusCompleted")}</option>
            </select>
          </div>
          <p className="text-sm text-notion-text-secondary">{wf.description}</p>

          {/* Messages */}
          {wf.requests.length > 0 && (
            <div className="mt-3 space-y-2 border-l-2 border-notion-border pl-3">
              {wf.requests.map((req) => (
                <div key={req.id} className="text-sm">
                  <span className="font-medium text-notion-text">
                    {req.user.name}{" "}
                    <span className="text-xs text-notion-text-secondary">({req.type})</span>
                  </span>
                  <p className="text-notion-text-secondary">{req.message}</p>
                  {req.documents.length > 0 && (
                    <div className="flex gap-2 mt-1">
                      {req.documents.map((doc) => (
                        <a
                          key={doc.id}
                          href={`/api/documents/${doc.id}/download`}
                          className="text-xs text-blue-600 hover:text-blue-700 underline"
                        >
                          {doc.fileName}
                        </a>
                      ))}
                    </div>
                  )}
                  <span className="text-xs text-notion-text-secondary">
                    {new Date(req.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Reply */}
          <div className="mt-3 flex gap-2">
            {replyState.activeId === wf.id ? (
              <>
                <input
                  value={replyState.texts[wf.id] || ""}
                  onChange={(e) =>
                    replyState.setTexts((prev) => ({ ...prev, [wf.id]: e.target.value }))
                  }
                  placeholder={t("admin.workflow.messagePlaceholder")}
                  className="notion-input flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onReply(wf.id, replyState.texts[wf.id] || "");
                  }}
                />
                <button
                  onClick={() => onReply(wf.id, replyState.texts[wf.id] || "")}
                  className="px-3 py-1.5 bg-notion-text text-white text-xs rounded-md font-medium hover:bg-notion-text/90 transition-colors"
                >
                  {t("common.submit")}
                </button>
              </>
            ) : (
              <button
                onClick={() => replyState.setActiveId(wf.id)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {t("admin.workflow.reply")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TabWorkflow({ workflows, applicationId, onRefresh }: TabWorkflowProps) {
  const t = useTranslations();
  const [showModal, setShowModal] = useState(false);
  const [messageTexts, setMessageTexts] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const sortedWorkflows = [...workflows].sort((a, b) => a.order - b.order);

  async function updateWorkflowStatus(workflowId: string, newStatus: string) {
    const res = await fetch(`/api/workflows/${workflowId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast(t("admin.toast.workflowUpdated"), "success");
      onRefresh();
    }
  }

  async function sendMessage(workflowId: string, text: string) {
    if (!text.trim()) return;
    const res = await fetch(`/api/workflows/${workflowId}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "REQUEST", message: text }),
    });
    if (res.ok) {
      setMessageTexts((prev) => ({ ...prev, [workflowId]: "" }));
      setActiveReplyId(null);
      onRefresh();
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = sortedWorkflows.findIndex((w) => w.id === active.id);
    const newIdx = sortedWorkflows.findIndex((w) => w.id === over.id);
    const reordered = arrayMove(sortedWorkflows, oldIdx, newIdx);

    // Update order for each item
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].order !== i + 1) {
        await fetch(`/api/workflows/${reordered[i].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: i + 1 }),
        });
      }
    }
    onRefresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-notion-text">
          {t("admin.tabs.workflow")}
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          + {t("admin.addStep")}
        </button>
      </div>

      {workflows.length === 0 ? (
        <div className="notion-card p-8 text-center">
          <p className="text-notion-text-secondary text-sm">{t("admin.workflow.empty")}</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedWorkflows.map((w) => w.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sortedWorkflows.map((wf) => (
                <SortableWorkflowItem
                  key={wf.id}
                  wf={wf}
                  onStatusChange={updateWorkflowStatus}
                  onReply={sendMessage}
                  replyState={{
                    activeId: activeReplyId,
                    texts: messageTexts,
                    setActiveId: setActiveReplyId,
                    setTexts: setMessageTexts,
                  }}
                  t={t}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <WorkflowFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        applicationId={applicationId}
        nextOrder={workflows.length + 1}
        onSuccess={() => {
          setShowModal(false);
          onRefresh();
        }}
      />
    </div>
  );
}
