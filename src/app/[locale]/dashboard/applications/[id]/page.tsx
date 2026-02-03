"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "@/components/ui/toaster";

interface WorkflowRequest {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  user: { name: string; role: string };
  documents: { id: string; fileName: string; filePath: string }[];
}

interface Workflow {
  id: string;
  title: string;
  description: string;
  order: number;
  status: string;
  requests: WorkflowRequest[];
}

interface Quote {
  id: string;
  amount: number;
  currency: string;
  description: string;
  validUntil: string;
  status: string;
}

interface Document {
  id: string;
  fileName: string;
  filePath: string;
  category: string;
  createdAt: string;
}

interface CompanyRecord {
  id: string;
  companyName: string;
  registrationNumber: string;
  registrationDate: string;
  status: string;
  documents: { id: string; fileName: string; filePath: string; category: string }[];
}

interface Application {
  id: string;
  companyName: string;
  companyType: string;
  fullName: string;
  email: string;
  phone: string;
  description: string;
  status: string;
  createdAt: string;
  quotes: Quote[];
  workflows: Workflow[];
  documents: Document[];
  companyRecord: CompanyRecord | null;
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    NEW: "badge-new",
    IN_REVIEW: "badge-new",
    QUOTED: "badge-quoted",
    ACCEPTED: "badge-accepted",
    IN_PROGRESS: "badge-progress",
    COMPLETED: "badge-completed",
  };
  return map[status] || "badge-new";
}

export default function ApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { status } = useSession();
  const t = useTranslations();
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") fetchApp();
  }, [status]);

  async function fetchApp() {
    const res = await fetch(`/api/applications/${id}`);
    if (res.ok) {
      const data = await res.json();
      setApp(data.application);
    }
    setLoading(false);
  }

  async function respondToQuote(quoteId: string, action: string) {
    const res = await fetch(`/api/quotes/${quoteId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      toast(action === "accept" ? "Teklif kabul edildi" : "Teklif reddedildi", "success");
      fetchApp();
    }
  }

  async function sendMessage(workflowId: string) {
    if (!messageText.trim()) return;
    const res = await fetch(`/api/workflows/${workflowId}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "QUESTION", message: messageText }),
    });
    if (res.ok) {
      setMessageText("");
      fetchApp();
    }
  }

  async function uploadDocument(applicationId: string) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.jpeg,.png,.docx";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("applicationId", applicationId);
      formData.append("category", "APPLICATION_DOC");
      const res = await fetch("/api/documents", { method: "POST", body: formData });
      if (res.ok) {
        toast("Evrak yüklendi", "success");
        fetchApp();
      } else {
        toast("Yükleme hatası", "error");
      }
    };
    input.click();
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] pt-[100px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-navy-200 border-t-gold-500 rounded-full animate-spin" />
          <p className="text-navy-400 text-sm">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] pt-[100px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-navy-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-navy-400">{t("common.noData")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[100px]">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="gold-line" />
            <h1 className="font-display text-2xl font-bold text-navy-900 mt-2">{app.companyName}</h1>
            <p className="text-navy-400 text-sm mt-1">{app.companyType} &middot; {new Date(app.createdAt).toLocaleDateString()}</p>
          </div>
          <span className={getStatusBadge(app.status)}>
            {t(`application.status.${app.status}`)}
          </span>
        </div>
      </div>

      {/* Quotes */}
      {app.quotes.length > 0 && (
        <div className="glass-card rounded-2xl mb-6">
          <h2 className="font-display text-lg font-semibold text-navy-900 p-6 border-b border-navy-100/50">{t("application.quote")}</h2>
          <div className="divide-y divide-navy-100/30">
            {app.quotes.map((quote) => (
              <div key={quote.id} className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-2xl font-display font-bold text-navy-900">
                      {quote.amount} {quote.currency}
                    </p>
                    <p className="text-sm text-navy-400 mt-1">{quote.description}</p>
                    <p className="text-xs text-navy-300 mt-1">
                      Geçerlilik: {new Date(quote.validUntil).toLocaleDateString()}
                    </p>
                  </div>
                  {quote.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => respondToQuote(quote.id, "accept")}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 text-sm font-medium transition-all duration-300"
                      >
                        {t("application.acceptQuote")}
                      </button>
                      <button
                        onClick={() => respondToQuote(quote.id, "reject")}
                        className="bg-red-500/10 text-red-600 px-4 py-2 rounded-xl hover:bg-red-500/20 text-sm font-medium transition-all duration-300"
                      >
                        {t("application.rejectQuote")}
                      </button>
                    </div>
                  )}
                  {quote.status !== "PENDING" && (
                    <span
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium ${
                        quote.status === "ACCEPTED"
                          ? "bg-green-50 text-green-600 border border-green-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                      }`}
                    >
                      {quote.status === "ACCEPTED" ? "Kabul Edildi" : "Reddedildi"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Timeline */}
      {app.workflows.length > 0 && (
        <div className="glass-card rounded-2xl mb-6">
          <h2 className="font-display text-lg font-semibold text-navy-900 p-6 border-b border-navy-100/50">{t("application.timeline")}</h2>
          <div className="p-6">
            <div className="space-y-6">
              {app.workflows.map((wf, idx) => (
                <div key={wf.id} className="relative pl-8">
                  {idx < app.workflows.length - 1 && (
                    <div className="absolute left-3 top-8 w-0.5 h-full bg-navy-100" />
                  )}
                  <div
                    className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      wf.status === "COMPLETED"
                        ? "bg-green-500 text-white"
                        : wf.status === "IN_PROGRESS"
                        ? "bg-gold-500 text-navy-950"
                        : "bg-navy-100 text-navy-400"
                    }`}
                  >
                    {wf.status === "COMPLETED" ? "✓" : idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-navy-900">{wf.title}</h3>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-xl font-medium ${
                          wf.status === "COMPLETED"
                            ? "bg-green-50 text-green-600 border border-green-200"
                            : wf.status === "IN_PROGRESS"
                            ? "bg-gold-50 text-gold-700 border border-gold-200"
                            : "bg-navy-50 text-navy-400 border border-navy-100"
                        }`}
                      >
                        {wf.status}
                      </span>
                    </div>
                    <p className="text-sm text-navy-400 mt-1">{wf.description}</p>

                    {/* Messages for this workflow step */}
                    {wf.requests.length > 0 && (
                      <div className="mt-3 space-y-2 border-l-2 border-navy-100/50 pl-4">
                        {wf.requests.map((req) => (
                          <div key={req.id} className="text-sm">
                            <span className="font-medium text-navy-900">
                              {req.user.name}{" "}
                              {req.user.role === "ADMIN" && (
                                <span className="text-xs bg-gold-50 text-gold-700 px-1.5 py-0.5 rounded-lg border border-gold-200">
                                  Admin
                                </span>
                              )}
                            </span>
                            <p className="text-navy-500 mt-0.5">{req.message}</p>
                            {req.documents.length > 0 && (
                              <div className="mt-1 flex gap-2 flex-wrap">
                                {req.documents.map((doc) => (
                                  <a
                                    key={doc.id}
                                    href={`/api/documents/${doc.id}/download`}
                                    className="text-xs text-gold-600 hover:text-gold-700 transition-colors"
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

                    {/* Message input */}
                    {wf.status !== "COMPLETED" && (
                      <div className="mt-3">
                        <button
                          onClick={() =>
                            setActiveWorkflowId(
                              activeWorkflowId === wf.id ? null : wf.id
                            )
                          }
                          className="text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors"
                        >
                          {t("application.sendMessage")}
                        </button>
                        {activeWorkflowId === wf.id && (
                          <div className="mt-2 flex gap-2">
                            <input
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              placeholder={t("application.askQuestion")}
                              className="flex-1 px-3 py-2 border border-navy-200 rounded-xl text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") sendMessage(wf.id);
                              }}
                            />
                            <button
                              onClick={() => sendMessage(wf.id)}
                              className="btn-primary !py-2 !px-4 !text-xs"
                            >
                              {t("common.submit")}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="glass-card rounded-2xl mb-6">
        <div className="flex items-center justify-between p-6 border-b border-navy-100/50">
          <h2 className="font-display text-lg font-semibold text-navy-900">{t("application.documents")}</h2>
          <button
            onClick={() => uploadDocument(app.id)}
            className="btn-primary !py-2 !px-4 !text-xs"
          >
            {t("application.uploadDocument")}
          </button>
        </div>
        {app.documents.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-navy-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-navy-400">{t("common.noData")}</p>
          </div>
        ) : (
          <div className="divide-y divide-navy-100/30">
            {app.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-navy-50/30 transition-colors duration-200">
                <div>
                  <p className="text-sm font-medium text-navy-900">{doc.fileName}</p>
                  <p className="text-xs text-navy-300">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={`/api/documents/${doc.id}/download`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-gold-600 hover:text-gold-700 transition-colors"
                >
                  {t("common.download")}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Company Record */}
      {app.companyRecord && (
        <div className="glass-card rounded-2xl mb-6">
          <h2 className="font-display text-lg font-semibold text-navy-900 p-6 border-b border-navy-100/50">{t("company.title")}</h2>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-navy-400">{t("company.registrationNumber")}</p>
                <p className="font-medium text-navy-900">{app.companyRecord.registrationNumber || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-navy-400">{t("company.registrationDate")}</p>
                <p className="font-medium text-navy-900">
                  {app.companyRecord.registrationDate
                    ? new Date(app.companyRecord.registrationDate).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>
            <h3 className="font-medium text-navy-900 mb-3">{t("company.documents")}</h3>
            {app.companyRecord.documents.length === 0 ? (
              <p className="text-sm text-navy-400">{t("common.noData")}</p>
            ) : (
              <div className="space-y-2">
                {app.companyRecord.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-navy-50/50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-navy-900">{doc.fileName}</p>
                      <span className="text-xs text-navy-400">
                        {t(`company.categories.${doc.category}`)}
                      </span>
                    </div>
                    <a
                      href={doc.filePath}
                      download
                      className="text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors"
                    >
                      {t("common.download")}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
