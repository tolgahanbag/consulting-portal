"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

interface KanbanQuickAddProps {
  status: string;
  onSave: (data: {
    companyName: string;
    fullName: string;
    email: string;
    phone: string;
    companyType: string;
    status: string;
  }) => void;
  onCancel: () => void;
}

export function KanbanQuickAdd({ status, onSave, onCancel }: KanbanQuickAddProps) {
  const t = useTranslations();
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyType, setCompanyType] = useState("limited");
  const [saving, setSaving] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim() || !fullName.trim() || !email.trim() || !phone.trim()) return;
    setSaving(true);
    onSave({
      companyName: companyName.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      companyType,
      status,
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onCancel();
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="notion-card p-3 space-y-2"
    >
      <input
        ref={firstInputRef}
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        placeholder={t("admin.kanban.quickAdd.companyName")}
        className="w-full text-sm bg-transparent border-b border-notion-border focus:border-blue-400 outline-none py-1 text-notion-text placeholder:text-notion-text-secondary/50"
        required
      />
      <input
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder={t("admin.kanban.quickAdd.fullName")}
        className="w-full text-sm bg-transparent border-b border-notion-border focus:border-blue-400 outline-none py-1 text-notion-text placeholder:text-notion-text-secondary/50"
        required
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("admin.kanban.quickAdd.email")}
        type="email"
        className="w-full text-sm bg-transparent border-b border-notion-border focus:border-blue-400 outline-none py-1 text-notion-text placeholder:text-notion-text-secondary/50"
        required
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder={t("admin.kanban.quickAdd.phone")}
        className="w-full text-sm bg-transparent border-b border-notion-border focus:border-blue-400 outline-none py-1 text-notion-text placeholder:text-notion-text-secondary/50"
        required
      />
      <select
        value={companyType}
        onChange={(e) => setCompanyType(e.target.value)}
        className="w-full text-xs bg-transparent border border-notion-border rounded py-1 px-1.5 text-notion-text outline-none focus:border-blue-400"
      >
        <option value="limited">{t("applicationForm.companyTypes.limited")}</option>
        <option value="anonim">{t("applicationForm.companyTypes.anonim")}</option>
        <option value="sahis">{t("applicationForm.companyTypes.sahis")}</option>
        <option value="sube">{t("applicationForm.companyTypes.sube")}</option>
      </select>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 text-xs py-1.5 rounded bg-notion-text text-white hover:bg-notion-text/90 transition-colors disabled:opacity-50"
        >
          {t("common.save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 text-xs py-1.5 rounded border border-notion-border text-notion-text-secondary hover:bg-notion-bg-hover transition-colors"
        >
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}
