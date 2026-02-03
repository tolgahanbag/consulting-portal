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
  documents: { id: string; fileName: string }[];
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

interface ApplicationNote {
  id: string;
  content: string;
  createdAt: string;
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
  documents: { id: string; fileName: string; category: string }[];
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
  notes: ApplicationNote[];
  companyRecord: CompanyRecord | null;
}

export default function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const t = useTranslations();
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showWorkflowForm, setShowWorkflowForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      const user = session?.user as { role?: string } | undefined;
      if (user?.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }
      fetchApp();
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, session, router]);

  async function fetchApp() {
    const res = await fetch(`/api/applications/${id}`);
    if (res.ok) {
      const data = await res.json();
      setApp(data.application);
    }
    setLoading(false);
  }

  async function updateStatus(newStatus: string) {
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast("Durum güncellendi", "success");
      fetchApp();
    }
  }

  async function sendQuote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: id,
        amount: formData.get("amount"),
        currency: formData.get("currency"),
        description: formData.get("description"),
        validUntil: formData.get("validUntil"),
      }),
    });
    if (res.ok) {
      toast("Teklif gönderildi", "success");
      setShowQuoteForm(false);
      fetchApp();
    }
  }

  async function addWorkflow(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: id,
        title: formData.get("title"),
        description: formData.get("description"),
        order: formData.get("order"),
      }),
    });
    if (res.ok) {
      toast("İş akışı adımı eklendi", "success");
      setShowWorkflowForm(false);
      fetchApp();
    }
  }

  async function updateWorkflowStatus(workflowId: string, newStatus: string) {
    const res = await fetch(`/api/workflows/${workflowId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast("Adım güncellendi", "success");
      fetchApp();
    }
  }

  async function addNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await fetch(`/api/applications/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: formData.get("content") }),
    });
    if (res.ok) {
      toast("Not eklendi", "success");
      setShowNoteForm(false);
      fetchApp();
    }
  }

  async function createCompany(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: id,
        companyName: formData.get("companyName"),
        registrationNumber: formData.get("registrationNumber"),
        registrationDate: formData.get("registrationDate"),
      }),
    });
    if (res.ok) {
      toast("Şirket kaydı oluşturuldu", "success");
      setShowCompanyForm(false);
      fetchApp();
    }
  }

  async function sendMessage(workflowId: string) {
    if (!messageText.trim()) return;
    const res = await fetch(`/api/workflows/${workflowId}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "REQUEST", message: messageText }),
    });
    if (res.ok) {
      setMessageText("");
      fetchApp();
    }
  }

  async function uploadDocument() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.jpeg,.png,.docx";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("applicationId", id);
      formData.append("category", "APPLICATION_DOC");
      const res = await fetch("/api/documents", { method: "POST", body: formData });
      if (res.ok) {
        toast("Evrak yüklendi", "success");
        fetchApp();
      }
    };
    input.click();
  }

  async function uploadCompanyDocument(companyRecordId: string) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.jpeg,.png,.docx";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const category = prompt("Kategori (REGISTRATION, TAX, LICENSE, OTHER):", "REGISTRATION") || "OTHER";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      const res = await fetch(`/api/company/${companyRecordId}/documents`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        toast("Şirket evrakı yüklendi", "success");
        fetchApp();
      }
    };
    input.click();
  }

  if (loading || !app) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{app.companyName}</h1>
          <p className="text-gray-600">
            {app.fullName} &middot; {app.email} &middot; {app.phone}
          </p>
          <p className="text-sm text-gray-500 mt-1">{app.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={app.status}
            onChange={(e) => updateStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {["NEW", "IN_REVIEW", "QUOTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED"].map(
              (s) => (
                <option key={s} value={s}>
                  {t(`application.status.${s}`)}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setShowQuoteForm(!showQuoteForm)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700"
        >
          {t("admin.sendQuote")}
        </button>
        <button
          onClick={() => setShowWorkflowForm(!showWorkflowForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700"
        >
          {t("admin.addStep")}
        </button>
        <button
          onClick={() => setShowNoteForm(!showNoteForm)}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
        >
          {t("admin.addNote")}
        </button>
        <button
          onClick={uploadDocument}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {t("common.upload")}
        </button>
        {!app.companyRecord && (
          <button
            onClick={() => setShowCompanyForm(!showCompanyForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
          >
            {t("admin.companySetup")}
          </button>
        )}
      </div>

      {/* Quote Form */}
      {showQuoteForm && (
        <form onSubmit={sendQuote} className="bg-orange-50 p-6 rounded-xl border mb-6 space-y-4">
          <h3 className="font-semibold">{t("admin.quoteForm.title")}</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("admin.quoteForm.amount")}</label>
              <input name="amount" type="number" step="0.01" required className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("admin.quoteForm.currency")}</label>
              <select name="currency" className="w-full px-3 py-2 border rounded-lg">
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="TRY">TRY</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("admin.quoteForm.validUntil")}</label>
              <input name="validUntil" type="date" required className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("admin.quoteForm.description")}</label>
            <textarea name="description" rows={3} required className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <button type="submit" className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700">
            {t("admin.quoteForm.send")}
          </button>
        </form>
      )}

      {/* Workflow Form */}
      {showWorkflowForm && (
        <form onSubmit={addWorkflow} className="bg-purple-50 p-6 rounded-xl border mb-6 space-y-4">
          <h3 className="font-semibold">{t("admin.workflowForm.title")}</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">{t("admin.workflowForm.stepTitle")}</label>
              <input name="title" required className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("admin.workflowForm.order")}</label>
              <input
                name="order"
                type="number"
                required
                defaultValue={(app.workflows.length + 1).toString()}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("admin.workflowForm.stepDescription")}</label>
            <textarea name="description" rows={2} required className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
            {t("admin.addStep")}
          </button>
        </form>
      )}

      {/* Note Form */}
      {showNoteForm && (
        <form onSubmit={addNote} className="bg-gray-100 p-6 rounded-xl border mb-6 space-y-4">
          <h3 className="font-semibold">{t("admin.addNote")}</h3>
          <textarea name="content" rows={3} required className="w-full px-3 py-2 border rounded-lg" />
          <button type="submit" className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700">
            {t("common.save")}
          </button>
        </form>
      )}

      {/* Company Setup Form */}
      {showCompanyForm && (
        <form onSubmit={createCompany} className="bg-green-50 p-6 rounded-xl border mb-6 space-y-4">
          <h3 className="font-semibold">{t("admin.companySetup")}</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Şirket Adı</label>
              <input name="companyName" required defaultValue={app.companyName} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("company.registrationNumber")}</label>
              <input name="registrationNumber" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("company.registrationDate")}</label>
              <input name="registrationDate" type="date" className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            {t("common.save")}
          </button>
        </form>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quotes */}
        <div className="bg-white rounded-xl border shadow-sm">
          <h2 className="text-lg font-semibold p-4 border-b">{t("application.quote")}</h2>
          {app.quotes.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">{t("common.noData")}</p>
          ) : (
            <div className="divide-y">
              {app.quotes.map((q) => (
                <div key={q.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <p className="font-bold">
                      {q.amount} {q.currency}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        q.status === "ACCEPTED"
                          ? "bg-green-100 text-green-700"
                          : q.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{q.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border shadow-sm">
          <h2 className="text-lg font-semibold p-4 border-b">Notlar</h2>
          {app.notes.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">{t("common.noData")}</p>
          ) : (
            <div className="divide-y">
              {app.notes.map((n) => (
                <div key={n.id} className="p-4">
                  <p className="text-sm">{n.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Workflows */}
      <div className="bg-white rounded-xl border shadow-sm mt-6">
        <h2 className="text-lg font-semibold p-4 border-b">{t("application.timeline")}</h2>
        {app.workflows.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">{t("common.noData")}</p>
        ) : (
          <div className="p-4 space-y-4">
            {app.workflows.map((wf) => (
              <div key={wf.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">
                    {wf.order}. {wf.title}
                  </h3>
                  <select
                    value={wf.status}
                    onChange={(e) => updateWorkflowStatus(wf.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded border ${
                      wf.status === "COMPLETED"
                        ? "bg-green-50 border-green-200"
                        : wf.status === "IN_PROGRESS"
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
                <p className="text-sm text-gray-600">{wf.description}</p>

                {/* Messages */}
                {wf.requests.length > 0 && (
                  <div className="mt-3 space-y-2 border-l-2 border-gray-100 pl-3">
                    {wf.requests.map((req) => (
                      <div key={req.id} className="text-sm">
                        <span className="font-medium">
                          {req.user.name}{" "}
                          <span className="text-xs text-gray-400">({req.type})</span>
                        </span>
                        <p className="text-gray-600">{req.message}</p>
                        <span className="text-xs text-gray-400">
                          {new Date(req.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply */}
                <div className="mt-3 flex gap-2">
                  {activeWorkflowId === wf.id ? (
                    <>
                      <input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Mesaj yazın..."
                        className="flex-1 px-3 py-1 border rounded text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") sendMessage(wf.id);
                        }}
                      />
                      <button
                        onClick={() => sendMessage(wf.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        {t("common.submit")}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setActiveWorkflowId(wf.id)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Yanıtla
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl border shadow-sm mt-6">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t("application.documents")}</h2>
        </div>
        {app.documents.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">{t("common.noData")}</p>
        ) : (
          <div className="divide-y">
            {app.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">{doc.fileName}</p>
                  <p className="text-xs text-gray-400">
                    {doc.category} &middot; {new Date(doc.createdAt).toLocaleDateString()}
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
        <div className="bg-white rounded-xl border shadow-sm mt-6">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">{t("company.title")}</h2>
            <button
              onClick={() => uploadCompanyDocument(app.companyRecord!.id)}
              className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
            >
              Evrak Yükle
            </button>
          </div>
          <div className="p-4">
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
            {app.companyRecord.documents.length > 0 && (
              <div className="space-y-2">
                {app.companyRecord.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">{doc.category}</p>
                    </div>
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
