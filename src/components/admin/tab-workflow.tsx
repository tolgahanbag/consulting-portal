"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/toaster";
import type { Workflow } from "@/types/admin";
import { WorkflowFormModal } from "./workflow-form-modal";

interface TabWorkflowProps {
  workflows: Workflow[];
  applicationId: string;
  onRefresh: () => void;
}

export function TabWorkflow({ workflows, applicationId, onRefresh }: TabWorkflowProps) {
  const t = useTranslations();
  const [showModal, setShowModal] = useState(false);
  const [messageTexts, setMessageTexts] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

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

  async function sendMessage(workflowId: string) {
    const text = messageTexts[workflowId]?.trim();
    if (!text) return;
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-navy-900">
          {t("admin.tabs.workflow")}
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="bg-navy-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-navy-800 transition-all duration-300"
        >
          {t("admin.addStep")}
        </button>
      </div>

      {workflows.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-navy-400 text-sm">{t("admin.workflow.empty")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workflows.map((wf) => (
            <div key={wf.id} className="glass-card rounded-2xl p-4 hover:shadow-glass-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-navy-900">
                  {wf.order}. {wf.title}
                </h4>
                <select
                  value={wf.status}
                  onChange={(e) => updateWorkflowStatus(wf.id, e.target.value)}
                  className={`text-xs px-2.5 py-1 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-gold-500/30 transition-all ${
                    wf.status === "COMPLETED"
                      ? "bg-green-50 border-green-200 text-green-600"
                      : wf.status === "IN_PROGRESS"
                      ? "bg-gold-50 border-gold-200 text-gold-700"
                      : "bg-navy-50 border-navy-100 text-navy-400"
                  }`}
                >
                  <option value="PENDING">{t("admin.workflow.statusPending")}</option>
                  <option value="IN_PROGRESS">{t("admin.workflow.statusInProgress")}</option>
                  <option value="COMPLETED">{t("admin.workflow.statusCompleted")}</option>
                </select>
              </div>
              <p className="text-sm text-navy-400">{wf.description}</p>

              {/* Messages */}
              {wf.requests.length > 0 && (
                <div className="mt-3 space-y-2 border-l-2 border-navy-100/50 pl-3">
                  {wf.requests.map((req) => (
                    <div key={req.id} className="text-sm">
                      <span className="font-medium text-navy-900">
                        {req.user.name}{" "}
                        <span className="text-xs text-navy-300">({req.type})</span>
                      </span>
                      <p className="text-navy-500">{req.message}</p>
                      {req.documents.length > 0 && (
                        <div className="flex gap-2 mt-1">
                          {req.documents.map((doc) => (
                            <a
                              key={doc.id}
                              href={`/api/documents/${doc.id}/download`}
                              className="text-xs text-gold-600 hover:text-gold-700 underline"
                            >
                              {doc.fileName}
                            </a>
                          ))}
                        </div>
                      )}
                      <span className="text-xs text-navy-300">
                        {new Date(req.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply */}
              <div className="mt-3 flex gap-2">
                {activeReplyId === wf.id ? (
                  <>
                    <input
                      value={messageTexts[wf.id] || ""}
                      onChange={(e) =>
                        setMessageTexts((prev) => ({ ...prev, [wf.id]: e.target.value }))
                      }
                      placeholder={t("admin.workflow.messagePlaceholder")}
                      className="flex-1 px-3 py-1.5 border border-navy-200 rounded-xl text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") sendMessage(wf.id);
                      }}
                    />
                    <button
                      onClick={() => sendMessage(wf.id)}
                      className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 py-1.5 px-3 text-xs rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                    >
                      {t("common.submit")}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setActiveReplyId(wf.id)}
                    className="text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors"
                  >
                    {t("admin.workflow.reply")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
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
