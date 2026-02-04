"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "@/components/ui/toaster";

const LOCALE_LABELS: Record<string, string> = {
  tr: "Turkce",
  en: "English",
  et: "Eesti",
};

export default function TranslationsPage() {
  const { data: session, status } = useSession();
  const t = useTranslations();
  const router = useRouter();

  const [locale, setLocale] = useState("tr");
  const [translations, setTranslations] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const user = session?.user as { role?: string } | undefined;
      if (user?.role !== "ADMIN") router.push("/dashboard");
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, session, router]);

  const fetchTranslations = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/translations?locale=${locale}`);
    if (res.ok) {
      const data = await res.json();
      setTranslations(data.translations || {});
    }
    setLoading(false);
  }, [locale]);

  useEffect(() => {
    if (status === "authenticated") fetchTranslations();
  }, [status, fetchTranslations]);

  // Flatten nested object to key-value pairs
  function flatten(obj: Record<string, unknown>, prefix = ""): [string, string][] {
    const result: [string, string][] = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        result.push(...flatten(value as Record<string, unknown>, fullKey));
      } else {
        result.push([fullKey, String(value)]);
      }
    }
    return result;
  }

  const flatEntries = flatten(translations);
  const filtered = search
    ? flatEntries.filter(
        ([key, val]) =>
          key.toLowerCase().includes(search.toLowerCase()) ||
          val.toLowerCase().includes(search.toLowerCase())
      )
    : flatEntries;

  async function handleSave() {
    if (!editKey) return;
    setSaving(true);
    const res = await fetch("/api/admin/translations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale, key: editKey, value: editValue }),
    });
    if (res.ok) {
      toast(t("i18nAdmin.saveSuccess"), "success");
      setEditKey(null);
      fetchTranslations();
    } else {
      toast(t("i18nAdmin.saveError"), "error");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-notion-border border-t-notion-text rounded-full animate-spin" />
          <p className="text-notion-text-secondary text-sm">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-notion-text mb-1">{t("i18nAdmin.title")}</h1>
      <p className="text-notion-text-secondary text-sm mb-8">{t("i18nAdmin.subtitle")}</p>

      {/* Locale Tabs + Search */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-1.5">
          {Object.entries(LOCALE_LABELS).map(([loc, label]) => (
            <button
              key={loc}
              onClick={() => setLocale(loc)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                locale === loc
                  ? "bg-notion-text text-white"
                  : "text-notion-text-secondary hover:bg-notion-bg-hover"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-notion-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("i18nAdmin.searchPlaceholder")}
            className="notion-input pl-10"
          />
        </div>
      </div>

      {/* Info */}
      <p className="text-xs text-notion-text-secondary mb-4">
        {filtered.length} {t("i18nAdmin.keysFound")}
      </p>

      {/* Translation Table */}
      <div className="border border-notion-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0">
              <tr className="border-b border-notion-border bg-notion-bg-secondary">
                <th className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider w-1/3">
                  {t("i18nAdmin.key")}
                </th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider">
                  {t("i18nAdmin.value")}
                </th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider w-20">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-notion-border">
              {filtered.map(([key, value]) => (
                <tr key={key} className="hover:bg-notion-bg-hover transition-colors">
                  <td className="px-3 py-2 text-xs font-mono text-notion-text-secondary break-all">
                    {key}
                  </td>
                  <td className="px-3 py-2 text-sm text-notion-text">
                    {editKey === key ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSave()}
                          className="notion-input flex-1 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-2 py-1 rounded text-xs bg-notion-text text-white hover:bg-notion-text/90 disabled:opacity-50 transition-colors"
                        >
                          {t("common.save")}
                        </button>
                        <button
                          onClick={() => setEditKey(null)}
                          className="px-2 py-1 rounded text-xs text-notion-text-secondary border border-notion-border hover:bg-notion-bg-hover transition-colors"
                        >
                          {t("common.cancel")}
                        </button>
                      </div>
                    ) : (
                      <span className="break-words">{value}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {editKey !== key && (
                      <button
                        onClick={() => {
                          setEditKey(key);
                          setEditValue(value);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors"
                      >
                        {t("common.edit")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-notion-text-secondary text-sm">{t("common.noData")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
