"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/toaster";

export function ApplicationForm() {
  const t = useTranslations("applicationForm");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      companyName: formData.get("companyName"),
      companyType: formData.get("companyType"),
      description: formData.get("description"),
    };

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSubmitted(true);
        toast(t("successMessage"), "success");
      } else {
        toast(t("errorMessage"), "error");
      }
    } catch {
      toast(t("errorMessage"), "error");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-16 glass-card rounded-2xl">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-green-50 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-xl font-display font-semibold text-navy-900 mb-2">
          {t("successMessage")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 md:p-10 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">
            {t("fullName")} <span className="text-gold-500">*</span>
          </label>
          <input
            name="fullName"
            required
            className="input-premium"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">
            {t("email")} <span className="text-gold-500">*</span>
          </label>
          <input
            name="email"
            type="email"
            required
            className="input-premium"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">
            {t("phone")} <span className="text-gold-500">*</span>
          </label>
          <input
            name="phone"
            required
            className="input-premium"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">
            {t("companyName")} <span className="text-gold-500">*</span>
          </label>
          <input
            name="companyName"
            required
            className="input-premium"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-2">
          {t("companyType")} <span className="text-gold-500">*</span>
        </label>
        <select
          name="companyType"
          required
          className="input-premium"
        >
          <option value="">{t("companyType")}</option>
          <option value="limited">{t("companyTypes.limited")}</option>
          <option value="anonim">{t("companyTypes.anonim")}</option>
          <option value="sahis">{t("companyTypes.sahis")}</option>
          <option value="sube">{t("companyTypes.sube")}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-2">
          {t("description")}
        </label>
        <textarea
          name="description"
          rows={4}
          className="input-premium resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full !py-4 !text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
            <span>...</span>
          </div>
        ) : (
          <>
            {t("submit")}
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
