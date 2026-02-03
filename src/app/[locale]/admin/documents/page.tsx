"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { toast } from "@/components/ui/toaster";
import { getCategoryBadgeClass, formatFileType } from "@/lib/status-utils";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { AdminDocument, DocumentStats, AppOption } from "@/types/admin";

type SortKey = "fileName" | "category" | "createdAt";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 20;

export default function AdminDocumentsPage() {
  const { data: session, status } = useSession();
  const t = useTranslations();
  const router = useRouter();

  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [stats, setStats] = useState<DocumentStats>({ total: 0, applicationDoc: 0, companyDoc: 0, other: 0 });
  const [applications, setApplications] = useState<AppOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [fileType, setFileType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Sort & pagination
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Auth guard
  useEffect(() => {
    if (status === "authenticated") {
      const user = session?.user as { role?: string } | undefined;
      if (user?.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, session, router]);

  const fetchDocuments = useCallback(async () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category) params.set("category", category);
    if (applicationId) params.set("applicationId", applicationId);
    if (fileType) params.set("fileType", fileType);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    const res = await fetch(`/api/admin/documents?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setDocuments(data.documents || []);
      setStats(data.stats || { total: 0, applicationDoc: 0, companyDoc: 0, other: 0 });
      setApplications(data.applications || []);
    }
    setLoading(false);
  }, [debouncedSearch, category, applicationId, fileType, dateFrom, dateTo]);

  useEffect(() => {
    if (status === "authenticated") {
      setLoading(true);
      fetchDocuments();
    }
  }, [status, fetchDocuments]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, applicationId, fileType, dateFrom, dateTo, sortKey, sortDir]);

  async function handleDelete() {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/documents/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast(t("adminDocuments.deleteSuccess"), "success");
      setDeleteId(null);
      fetchDocuments();
    } else {
      toast(t("adminDocuments.deleteError"), "error");
    }
  }

  const sorted = useMemo(() => {
    const arr = [...documents];
    arr.sort((a, b) => {
      if (sortKey === "createdAt") {
        return sortDir === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      const av = (a[sortKey] || "").toLowerCase();
      const bv = (b[sortKey] || "").toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [documents, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-navy-300 ml-1">&#8597;</span>;
    return <span className="text-gold-500 ml-1">{sortDir === "asc" ? "&#9650;" : "&#9660;"}</span>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-navy-200 border-t-gold-500 rounded-full animate-spin" />
          <p className="text-navy-400 text-sm">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="gold-line" />
          <span className="text-gold-600 text-sm font-medium tracking-[0.15em] uppercase">
            Admin
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold text-navy-900">
          {t("adminDocuments.title")}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: t("adminDocuments.totalDocuments"), value: stats.total, color: "text-navy-900" },
          { label: t("adminDocuments.applicationDocs"), value: stats.applicationDoc, color: "text-blue-600" },
          { label: t("adminDocuments.companyDocs"), value: stats.companyDoc, color: "text-purple-600" },
          { label: t("adminDocuments.otherDocs"), value: stats.other, color: "text-green-600" },
        ].map((stat, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-5 text-center group hover:shadow-glass-lg transition-all duration-300">
            <p className="text-xs font-medium text-navy-500 uppercase tracking-wide mb-2">
              {stat.label}
            </p>
            <p className={`text-3xl font-display font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("adminDocuments.searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2 border border-navy-200 rounded-xl text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-300 ${
            showFilters
              ? "bg-navy-900 text-white border-navy-900"
              : "bg-white text-navy-500 border-navy-200 hover:border-navy-300"
          }`}
        >
          {t("common.filter")}
          <svg className={`w-4 h-4 ml-1 inline-block transition-transform ${showFilters ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Filters (collapsible) */}
      {showFilters && (
        <div className="glass-card rounded-2xl p-4 mb-6 space-y-4 animate-fade-up">
          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            {["", "APPLICATION_DOC", "COMPANY_DOC", "OTHER"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  category === cat
                    ? "bg-navy-900 text-white shadow-lg"
                    : "bg-white text-navy-500 border border-navy-100 hover:border-navy-200"
                }`}
              >
                {cat === ""
                  ? t("adminDocuments.allCategories")
                  : t(`adminDocuments.categoryLabels.${cat}`)}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Application dropdown */}
            <select
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              className="px-3 py-2 border border-navy-200 rounded-xl text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
            >
              <option value="">{t("adminDocuments.allApplications")}</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.companyName}
                </option>
              ))}
            </select>

            {/* File type dropdown */}
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="px-3 py-2 border border-navy-200 rounded-xl text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
            >
              <option value="">{t("adminDocuments.allFileTypes")}</option>
              <option value="application/pdf">PDF</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/png">PNG</option>
              <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">DOCX</option>
            </select>

            {/* Date range */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-navy-400 whitespace-nowrap">{t("adminDocuments.dateFrom")}</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 px-2 py-2 border border-navy-200 rounded-xl text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-navy-400 whitespace-nowrap">{t("adminDocuments.dateTo")}</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 px-2 py-2 border border-navy-200 rounded-xl text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Documents Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-100/50">
                <th
                  onClick={() => toggleSort("fileName")}
                  className="text-left px-6 py-4 text-xs font-semibold text-navy-400 uppercase tracking-wider cursor-pointer select-none hover:text-navy-600"
                >
                  {t("adminDocuments.fileName")}
                  <SortIcon col="fileName" />
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-navy-400 uppercase tracking-wider">
                  {t("adminDocuments.application")}
                </th>
                <th
                  onClick={() => toggleSort("category")}
                  className="text-left px-6 py-4 text-xs font-semibold text-navy-400 uppercase tracking-wider cursor-pointer select-none hover:text-navy-600"
                >
                  {t("adminDocuments.category")}
                  <SortIcon col="category" />
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-navy-400 uppercase tracking-wider">
                  {t("adminDocuments.uploadedBy")}
                </th>
                <th
                  onClick={() => toggleSort("createdAt")}
                  className="text-left px-6 py-4 text-xs font-semibold text-navy-400 uppercase tracking-wider cursor-pointer select-none hover:text-navy-600"
                >
                  {t("common.date")}
                  <SortIcon col="createdAt" />
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-navy-400 uppercase tracking-wider">
                  {t("adminDocuments.fileType")}
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-navy-400 uppercase tracking-wider">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100/30">
              {paginated.map((doc) => (
                <tr key={doc.id} className="hover:bg-navy-50/30 transition-colors duration-200">
                  <td className="px-6 py-4 text-sm font-medium text-navy-900 max-w-[200px] truncate" title={doc.fileName}>
                    {doc.fileName}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {doc.application ? (
                      <Link
                        href={`/admin/applications/${doc.application.id}`}
                        className="text-gold-600 hover:text-gold-700 font-medium transition-colors"
                      >
                        {doc.application.companyName}
                      </Link>
                    ) : (
                      <span className="text-navy-300">{t("adminDocuments.noApplication")}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-xl text-xs font-medium ${getCategoryBadgeClass(doc.category)}`}>
                      {t(`adminDocuments.categoryLabels.${doc.category}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-navy-500">
                    {doc.user.name || doc.user.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-navy-400">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-navy-400">
                    {formatFileType(doc.fileType)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        className="text-gold-600 hover:text-gold-700 text-sm font-medium transition-colors"
                      >
                        {t("common.download")}
                      </a>
                      <button
                        onClick={() => setDeleteId(doc.id)}
                        className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
                      >
                        {t("common.delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {documents.length === 0 && (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-navy-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <p className="text-navy-400">{t("common.noData")}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-navy-400">
            {t("admin.table.showing")} {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, sorted.length)}{" "}
            {t("admin.table.of")} {sorted.length} {t("admin.table.entries")}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl text-sm font-medium border border-navy-200 text-navy-600 hover:border-navy-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {t("admin.table.previous")}
            </button>
            <span className="px-3 py-1.5 text-sm text-navy-500">
              {t("admin.table.page")} {page} {t("admin.table.of")} {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl text-sm font-medium border border-navy-200 text-navy-600 hover:border-navy-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {t("admin.table.next")}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title={t("admin.confirm.deleteDocument")}
        message={t("admin.confirm.deleteDocumentMessage")}
        variant="danger"
      />
    </div>
  );
}
