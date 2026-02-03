"use client";

import { useEffect, useState, use } from "react";
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

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500">{t("common.loading")}</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500">{t("common.noData")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{app.companyName}</h1>
          <p className="text-gray-600">{app.companyType} &middot; {new Date(app.createdAt).toLocaleDateString()}</p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            app.status === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
          }`}
        >
          {t(`application.status.${app.status}`)}
        </span>
      </div>

      {/* Quotes */}
      {app.quotes.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm mb-6">
          <h2 className="text-lg font-semibold p-6 border-b">{t("application.quote")}</h2>
          <div className="divide-y">
            {app.quotes.map((quote) => (
              <div key={quote.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {quote.amount} {quote.currency}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{quote.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Geçerlilik: {new Date(quote.validUntil).toLocaleDateString()}
                    </p>
                  </div>
                  {quote.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => respondToQuote(quote.id, "accept")}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                      >
                        {t("application.acceptQuote")}
                      </button>
                      <button
                        onClick={() => respondToQuote(quote.id, "reject")}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                      >
                        {t("application.rejectQuote")}
                      </button>
                    </div>
                  )}
                  {quote.status !== "PENDING" && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        quote.status === "ACCEPTED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
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
        <div className="bg-white rounded-xl border shadow-sm mb-6">
          <h2 className="text-lg font-semibold p-6 border-b">{t("application.timeline")}</h2>
          <div className="p-6">
            <div className="space-y-6">
              {app.workflows.map((wf, idx) => (
                <div key={wf.id} className="relative pl-8">
                  {idx < app.workflows.length - 1 && (
                    <div className="absolute left-3 top-8 w-0.5 h-full bg-gray-200" />
                  )}
                  <div
                    className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      wf.status === "COMPLETED"
                        ? "bg-green-500 text-white"
                        : wf.status === "IN_PROGRESS"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {wf.status === "COMPLETED" ? "✓" : idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{wf.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          wf.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : wf.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {wf.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{wf.description}</p>

                    {/* Messages for this workflow step */}
                    {wf.requests.length > 0 && (
                      <div className="mt-3 space-y-2 border-l-2 border-gray-100 pl-4">
                        {wf.requests.map((req) => (
                          <div key={req.id} className="text-sm">
                            <span className="font-medium">
                              {req.user.name}{" "}
                              {req.user.role === "ADMIN" && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">
                                  Admin
                                </span>
                              )}
                            </span>
                            <p className="text-gray-600 mt-0.5">{req.message}</p>
                            {req.documents.length > 0 && (
                              <div className="mt-1 flex gap-2 flex-wrap">
                                {req.documents.map((doc) => (
                                  <a
                                    key={doc.id}
                                    href={`/api/documents/${doc.id}/download`}
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    {doc.fileName}
                                  </a>
                                ))}
                              </div>
                            )}
                            <span className="text-xs text-gray-400">
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
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {t("application.sendMessage")}
                        </button>
                        {activeWorkflowId === wf.id && (
                          <div className="mt-2 flex gap-2">
                            <input
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              placeholder={t("application.askQuestion")}
                              className="flex-1 px-3 py-2 border rounded-lg text-sm"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") sendMessage(wf.id);
                              }}
                            />
                            <button
                              onClick={() => sendMessage(wf.id)}
                              className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800"
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
      <div className="bg-white rounded-xl border shadow-sm mb-6">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{t("application.documents")}</h2>
          <button
            onClick={() => uploadDocument(app.id)}
            className="text-sm bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
          >
            {t("application.uploadDocument")}
          </button>
        </div>
        {app.documents.length === 0 ? (
          <p className="p-6 text-sm text-gray-500 text-center">{t("common.noData")}</p>
        ) : (
          <div className="divide-y">
            {app.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">{doc.fileName}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={`/api/documents/${doc.id}/download`}
                  className="text-sm text-blue-600 hover:underline"
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
        <div className="bg-white rounded-xl border shadow-sm mb-6">
          <h2 className="text-lg font-semibold p-6 border-b">{t("company.title")}</h2>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">{t("company.registrationNumber")}</p>
                <p className="font-medium">{app.companyRecord.registrationNumber || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("company.registrationDate")}</p>
                <p className="font-medium">
                  {app.companyRecord.registrationDate
                    ? new Date(app.companyRecord.registrationDate).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>
            <h3 className="font-medium mb-3">{t("company.documents")}</h3>
            {app.companyRecord.documents.length === 0 ? (
              <p className="text-sm text-gray-500">{t("common.noData")}</p>
            ) : (
              <div className="space-y-2">
                {app.companyRecord.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{doc.fileName}</p>
                      <span className="text-xs text-gray-500">
                        {t(`company.categories.${doc.category}`)}
                      </span>
                    </div>
                    <a
                      href={doc.filePath}
                      download
                      className="text-sm text-blue-600 hover:underline"
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
