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
  params: { id: string };
}) {
  const { id } = params;
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
      <div className="flex justify-center items-center min-h-[60vh] pt-[100px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-navy-200 border-t-gold-500 rounded-full animate-spin" />
          <p className="text-navy-400 text-sm">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[100px]">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="gold-line" />
            <h1 className="font-display text-2xl font-bold text-navy-900 mt-2">{app.companyName}</h1>
            <p className="text-navy-500 text-sm mt-1">
              {app.fullName} &middot; {app.email} &middot; {app.phone}
            </p>
            <p className="text-sm text-navy-400 mt-1">{app.description}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={app.status}
              onChange={(e) => updateStatus(e.target.value)}
              className="border border-navy-200 rounded-xl px-3 py-2 text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-navy-700"
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
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setShowQuoteForm(!showQuoteForm)}
          className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300"
        >
          {t("admin.sendQuote")}
        </button>
        <button
          onClick={() => setShowWorkflowForm(!showWorkflowForm)}
          className="bg-navy-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-navy-800 transition-all duration-300"
        >
          {t("admin.addStep")}
        </button>
        <button
          onClick={() => setShowNoteForm(!showNoteForm)}
          className="bg-white text-navy-600 border border-navy-200 px-4 py-2 rounded-xl text-sm font-medium hover:border-navy-300 hover:text-navy-800 transition-all duration-300"
        >
          {t("admin.addNote")}
        </button>
        <button
          onClick={uploadDocument}
          className="bg-white text-navy-600 border border-navy-200 px-4 py-2 rounded-xl text-sm font-medium hover:border-navy-300 hover:text-navy-800 transition-all duration-300"
        >
          {t("common.upload")}
        </button>
        {!app.companyRecord && (
          <button
            onClick={() => setShowCompanyForm(!showCompanyForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-all duration-300"
          >
            {t("admin.companySetup")}
          </button>
        )}
      </div>

      {/* Quote Form */}
      {showQuoteForm && (
        <form onSubmit={sendQuote} className="glass-card rounded-2xl p-6 mb-6 space-y-4 border-l-4 border-gold-500">
          <h3 className="font-display font-semibold text-navy-900">{t("admin.quoteForm.title")}</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-500 mb-1">{t("admin.quoteForm.amount")}</label>
              <input name="amount" type="number" step="0.01" required className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-500 mb-1">{t("admin.quoteForm.currency")}</label>
              <select name="currency" className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all">
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="TRY">TRY</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-500 mb-1">{t("admin.quoteForm.validUntil")}</label>
              <input name="validUntil" type="date" required className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-500 mb-1">{t("admin.quoteForm.description")}</label>
            <textarea name="description" rows={3} required className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all" />
          </div>
          <button type="submit" className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300">
            {t("admin.quoteForm.send")}
          </button>
        </form>
      )}

      {/* Workflow Form */}
      {showWorkflowForm && (
        <form onSubmit={addWorkflow} className="glass-card rounded-2xl p-6 mb-6 space-y-4 border-l-4 border-navy-900">
          <h3 className="font-display font-semibold text-navy-900">{t("admin.workflowForm.title")}</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-navy-500 mb-1">{t("admin.workflowForm.stepTitle")}</label>
              <input name="title" required className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-500 mb-1">{t("admin.workflowForm.order")}</label>
              <input
                name="order"
                type="number"
                required
                defaultValue={(app.workflows.length + 1).toString()}
                className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-500 mb-1">{t("admin.workflowForm.stepDescription")}</label>
            <textarea name="description" rows={2} required className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all" />
          </div>
          <button type="submit" className="bg-navy-900 text-white px-6 py-2 rounded-xl font-medium hover:bg-navy-800 transition-all duration-300">
            {t("admin.addStep")}
          </button>
        </form>
      )}

      {/* Note Form */}
      {showNoteForm && (
        <form onSubmit={addNote} className="glass-card rounded-2xl p-6 mb-6 space-y-4 border-l-4 border-navy-400">
          <h3 className="font-display font-semibold text-navy-900">{t("admin.addNote")}</h3>
          <textarea name="content" rows={3} required className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all" />
          <button type="submit" className="bg-navy-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-navy-700 transition-all duration-300">
            {t("common.save")}
          </button>
        </form>
      )}

      {/* Company Setup Form */}
      {showCompanyForm && (
        <form onSubmit={createCompany} className="glass-card rounded-2xl p-6 mb-6 space-y-4 border-l-4 border-green-500">
          <h3 className="font-display font-semibold text-navy-900">{t("admin.companySetup")}</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-500 mb-1">Şirket Adı</label>
              <input name="companyName" required defaultValue={app.companyName} className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-500 mb-1">{t("company.registrationNumber")}</label>
              <input name="registrationNumber" className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-500 mb-1">{t("company.registrationDate")}</label>
              <input name="registrationDate" type="date" className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all" />
            </div>
          </div>
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-green-700 transition-all duration-300">
            {t("common.save")}
          </button>
        </form>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quotes */}
        <div className="glass-card rounded-2xl">
          <h2 className="font-display text-lg font-semibold text-navy-900 p-4 border-b border-navy-100/50">{t("application.quote")}</h2>
          {app.quotes.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-navy-400 text-sm">{t("common.noData")}</p>
            </div>
          ) : (
            <div className="divide-y divide-navy-100/30">
              {app.quotes.map((q) => (
                <div key={q.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <p className="font-display font-bold text-navy-900">
                      {q.amount} {q.currency}
                    </p>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-xl font-medium ${
                        q.status === "ACCEPTED"
                          ? "bg-green-50 text-green-600 border border-green-200"
                          : q.status === "REJECTED"
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-gold-50 text-gold-700 border border-gold-200"
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>
                  <p className="text-sm text-navy-400 mt-1">{q.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="glass-card rounded-2xl">
          <h2 className="font-display text-lg font-semibold text-navy-900 p-4 border-b border-navy-100/50">Notlar</h2>
          {app.notes.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-navy-400 text-sm">{t("common.noData")}</p>
            </div>
          ) : (
            <div className="divide-y divide-navy-100/30">
              {app.notes.map((n) => (
                <div key={n.id} className="p-4">
                  <p className="text-sm text-navy-700">{n.content}</p>
                  <p className="text-xs text-navy-300 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Workflows */}
      <div className="glass-card rounded-2xl mt-6">
        <h2 className="font-display text-lg font-semibold text-navy-900 p-4 border-b border-navy-100/50">{t("application.timeline")}</h2>
        {app.workflows.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-navy-400 text-sm">{t("common.noData")}</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {app.workflows.map((wf) => (
              <div key={wf.id} className="border border-navy-100/50 rounded-xl p-4 hover:shadow-glass-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-navy-900">
                    {wf.order}. {wf.title}
                  </h3>
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
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
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
                        <span className="text-xs text-navy-300">
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
                        className="flex-1 px-3 py-1.5 border border-navy-200 rounded-xl text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") sendMessage(wf.id);
                        }}
                      />
                      <button
                        onClick={() => sendMessage(wf.id)}
                        className="btn-primary !py-1.5 !px-3 !text-xs"
                      >
                        {t("common.submit")}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setActiveWorkflowId(wf.id)}
                      className="text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors"
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
      <div className="glass-card rounded-2xl mt-6">
        <div className="flex items-center justify-between p-4 border-b border-navy-100/50">
          <h2 className="font-display text-lg font-semibold text-navy-900">{t("application.documents")}</h2>
        </div>
        {app.documents.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-navy-400 text-sm">{t("common.noData")}</p>
          </div>
        ) : (
          <div className="divide-y divide-navy-100/30">
            {app.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-navy-50/30 transition-colors duration-200">
                <div>
                  <p className="text-sm font-medium text-navy-900">{doc.fileName}</p>
                  <p className="text-xs text-navy-300">
                    {doc.category} &middot; {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={`/api/documents/${doc.id}/download`}
                  className="text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors"
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
        <div className="glass-card rounded-2xl mt-6">
          <div className="flex items-center justify-between p-4 border-b border-navy-100/50">
            <h2 className="font-display text-lg font-semibold text-navy-900">{t("company.title")}</h2>
            <button
              onClick={() => uploadCompanyDocument(app.companyRecord!.id)}
              className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-xl hover:bg-green-700 font-medium transition-all duration-300"
            >
              Evrak Yükle
            </button>
          </div>
          <div className="p-4">
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
            {app.companyRecord.documents.length > 0 && (
              <div className="space-y-2">
                {app.companyRecord.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-navy-50/50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-navy-900">{doc.fileName}</p>
                      <p className="text-xs text-navy-400">{doc.category}</p>
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
