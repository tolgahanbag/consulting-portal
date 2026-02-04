"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "@/components/ui/toaster";

interface EmailTemplate {
  subject: string;
  body: string;
}

interface WorkflowTemplate {
  title: string;
  description: string;
}

interface Settings {
  emailTemplates: Record<string, EmailTemplate>;
  workflowTemplates: WorkflowTemplate[];
  documentCategories: string[];
  companyDocumentCategories: string[];
}

type TabId = "email" | "workflow" | "categories";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const t = useTranslations();
  const router = useRouter();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("email");

  useEffect(() => {
    if (status === "authenticated") {
      const user = session?.user as { role?: string } | undefined;
      if (user?.role !== "ADMIN") router.push("/dashboard");
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, session, router]);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/admin/settings");
    if (res.ok) {
      const data = await res.json();
      setSettings(data.settings);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchSettings();
  }, [status, fetchSettings]);

  async function saveSetting(key: string, value: unknown) {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    if (res.ok) {
      toast(t("settings.saveSuccess"), "success");
      fetchSettings();
    } else {
      toast(t("settings.saveError"), "error");
    }
    setSaving(false);
  }

  if (loading || !settings) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-notion-border border-t-notion-text rounded-full animate-spin" />
          <p className="text-notion-text-secondary text-sm">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "email", label: t("settings.emailTemplates") },
    { id: "workflow", label: t("settings.workflowTemplates") },
    { id: "categories", label: t("settings.categories") },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-notion-text mb-1">{t("settings.title")}</h1>
      <p className="text-notion-text-secondary text-sm mb-8">{t("settings.subtitle")}</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-notion-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-notion-text text-notion-text"
                : "border-transparent text-notion-text-secondary hover:text-notion-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Email Templates */}
      {activeTab === "email" && (
        <EmailTemplatesTab
          templates={settings.emailTemplates}
          onSave={(templates) => saveSetting("emailTemplates", templates)}
          saving={saving}
          t={t}
        />
      )}

      {/* Workflow Templates */}
      {activeTab === "workflow" && (
        <WorkflowTemplatesTab
          templates={settings.workflowTemplates}
          onSave={(templates) => saveSetting("workflowTemplates", templates)}
          saving={saving}
          t={t}
        />
      )}

      {/* Categories */}
      {activeTab === "categories" && (
        <CategoriesTab
          docCategories={settings.documentCategories}
          companyCategories={settings.companyDocumentCategories}
          onSaveDoc={(cats) => saveSetting("documentCategories", cats)}
          onSaveCompany={(cats) => saveSetting("companyDocumentCategories", cats)}
          saving={saving}
          t={t}
        />
      )}
    </div>
  );
}

function EmailTemplatesTab({
  templates,
  onSave,
  saving,
  t,
}: {
  templates: Record<string, { subject: string; body: string }>;
  onSave: (v: Record<string, { subject: string; body: string }>) => void;
  saving: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const [local, setLocal] = useState(templates);

  const templateKeys = Object.keys(local);

  function update(key: string, field: "subject" | "body", value: string) {
    setLocal((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-notion-text-secondary">
        {t("settings.emailVariablesHint")}
      </p>
      {templateKeys.map((key) => (
        <div key={key} className="notion-card">
          <h3 className="text-sm font-semibold text-notion-text mb-3">
            {t(`settings.templateNames.${key}`, { defaultValue: key })}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-notion-text-secondary mb-1">
                {t("settings.subject")}
              </label>
              <input
                type="text"
                value={local[key].subject}
                onChange={(e) => update(key, "subject", e.target.value)}
                className="notion-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-notion-text-secondary mb-1">
                {t("settings.body")}
              </label>
              <textarea
                value={local[key].body}
                onChange={(e) => update(key, "body", e.target.value)}
                rows={4}
                className="notion-input w-full resize-y"
              />
            </div>
          </div>
        </div>
      ))}
      <div className="flex justify-end">
        <button
          onClick={() => onSave(local)}
          disabled={saving}
          className="px-4 py-2 rounded-md text-sm font-medium bg-notion-text text-white hover:bg-notion-text/90 disabled:opacity-50 transition-colors"
        >
          {saving ? t("common.loading") : t("common.save")}
        </button>
      </div>
    </div>
  );
}

function WorkflowTemplatesTab({
  templates,
  onSave,
  saving,
  t,
}: {
  templates: { title: string; description: string }[];
  onSave: (v: { title: string; description: string }[]) => void;
  saving: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const [local, setLocal] = useState(templates);

  function update(idx: number, field: "title" | "description", value: string) {
    setLocal((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  }

  function addTemplate() {
    setLocal((prev) => [...prev, { title: "", description: "" }]);
  }

  function removeTemplate(idx: number) {
    setLocal((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-notion-text-secondary">{t("settings.workflowHint")}</p>
      {local.map((tmpl, idx) => (
        <div key={idx} className="notion-card flex gap-3 items-start">
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={tmpl.title}
              onChange={(e) => update(idx, "title", e.target.value)}
              placeholder={t("settings.stepTitle")}
              className="notion-input w-full"
            />
            <input
              type="text"
              value={tmpl.description}
              onChange={(e) => update(idx, "description", e.target.value)}
              placeholder={t("settings.stepDescription")}
              className="notion-input w-full"
            />
          </div>
          <button
            onClick={() => removeTemplate(idx)}
            className="text-red-500 hover:text-red-600 p-1 mt-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={addTemplate}
        className="px-3 py-1.5 rounded-md text-sm text-notion-text-secondary border border-dashed border-notion-border hover:bg-notion-bg-hover transition-colors w-full"
      >
        + {t("settings.addStep")}
      </button>
      <div className="flex justify-end">
        <button
          onClick={() => onSave(local)}
          disabled={saving}
          className="px-4 py-2 rounded-md text-sm font-medium bg-notion-text text-white hover:bg-notion-text/90 disabled:opacity-50 transition-colors"
        >
          {saving ? t("common.loading") : t("common.save")}
        </button>
      </div>
    </div>
  );
}

function CategoriesTab({
  docCategories,
  companyCategories,
  onSaveDoc,
  onSaveCompany,
  saving,
  t,
}: {
  docCategories: string[];
  companyCategories: string[];
  onSaveDoc: (v: string[]) => void;
  onSaveCompany: (v: string[]) => void;
  saving: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const [localDoc, setLocalDoc] = useState(docCategories);
  const [localCompany, setLocalCompany] = useState(companyCategories);
  const [newDoc, setNewDoc] = useState("");
  const [newCompany, setNewCompany] = useState("");

  function addDocCat() {
    if (newDoc.trim() && !localDoc.includes(newDoc.trim().toUpperCase())) {
      setLocalDoc((prev) => [...prev, newDoc.trim().toUpperCase()]);
      setNewDoc("");
    }
  }

  function addCompanyCat() {
    if (newCompany.trim() && !localCompany.includes(newCompany.trim().toUpperCase())) {
      setLocalCompany((prev) => [...prev, newCompany.trim().toUpperCase()]);
      setNewCompany("");
    }
  }

  return (
    <div className="space-y-8">
      {/* Document Categories */}
      <div>
        <h3 className="text-sm font-semibold text-notion-text mb-3">{t("settings.docCategories")}</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {localDoc.map((cat) => (
            <span key={cat} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-notion-bg-secondary text-notion-text border border-notion-border">
              {cat}
              <button
                onClick={() => setLocalDoc((prev) => prev.filter((c) => c !== cat))}
                className="text-notion-text-secondary hover:text-red-500 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newDoc}
            onChange={(e) => setNewDoc(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addDocCat()}
            placeholder={t("settings.newCategory")}
            className="notion-input flex-1"
          />
          <button onClick={addDocCat} className="px-3 py-1.5 rounded-md text-sm bg-notion-text text-white hover:bg-notion-text/90 transition-colors">
            {t("settings.add")}
          </button>
        </div>
        <div className="flex justify-end mt-3">
          <button
            onClick={() => onSaveDoc(localDoc)}
            disabled={saving}
            className="px-4 py-2 rounded-md text-sm font-medium bg-notion-text text-white hover:bg-notion-text/90 disabled:opacity-50 transition-colors"
          >
            {saving ? t("common.loading") : t("common.save")}
          </button>
        </div>
      </div>

      {/* Company Document Categories */}
      <div>
        <h3 className="text-sm font-semibold text-notion-text mb-3">{t("settings.companyDocCategories")}</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {localCompany.map((cat) => (
            <span key={cat} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-notion-bg-secondary text-notion-text border border-notion-border">
              {cat}
              <button
                onClick={() => setLocalCompany((prev) => prev.filter((c) => c !== cat))}
                className="text-notion-text-secondary hover:text-red-500 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCompanyCat()}
            placeholder={t("settings.newCategory")}
            className="notion-input flex-1"
          />
          <button onClick={addCompanyCat} className="px-3 py-1.5 rounded-md text-sm bg-notion-text text-white hover:bg-notion-text/90 transition-colors">
            {t("settings.add")}
          </button>
        </div>
        <div className="flex justify-end mt-3">
          <button
            onClick={() => onSaveCompany(localCompany)}
            disabled={saving}
            className="px-4 py-2 rounded-md text-sm font-medium bg-notion-text text-white hover:bg-notion-text/90 disabled:opacity-50 transition-colors"
          >
            {saving ? t("common.loading") : t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
