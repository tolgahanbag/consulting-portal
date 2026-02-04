"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { toast } from "@/components/ui/toaster";

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

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [fileType, setFileType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

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
    if (sortKey !== col) return <span className="text-notion-text-secondary/50 ml-1">&#8597;</span>;
    return <span className="text-notion-text ml-1">{sortDir === "asc" ? "\u2191" : "\u2193"}</span>;
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

  const statCards = [
    { label: t("adminDocuments.totalDocuments"), value: stats.total },
    { label: t("adminDocuments.applicationDocs"), value: stats.applicationDoc },
    { label: t("adminDocuments.companyDocs"), value: stats.companyDoc },
    { label: t("adminDocuments.otherDocs"), value: stats.other },
  ];

  return (
    <div>
      {/* Title */}
      <h1 className="text-3xl font-bold text-notion-text mb-1">
        {t("adminDocuments.title")}
      </h1>
      <p className="text-notion-text-secondary text-sm mb-8">{t("common.documents")}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, idx) => (
          <div key={idx} className="notion-card flex flex-col">
            <p className="text-xs text-notion-text-secondary uppercase tracking-wide mb-1">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-notion-text">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-notion-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("adminDocuments.searchPlaceholder")}
            className="notion-input pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2 rounded-md text-sm transition-colors border ${
            showFilters
              ? "bg-notion-text text-white border-notion-text"
              : "text-notion-text-secondary border-notion-border hover:bg-notion-bg-hover"
          }`}
        >
          {t("common.filter")}
          <svg className={`w-3 h-3 ml-1 inline-block transition-transform ${showFilters ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="notion-card mb-6 space-y-4 animate-fade-up">
          <div className="flex gap-1.5 flex-wrap">
            {["", "APPLICATION_DOC", "COMPANY_DOC", "OTHER"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  category === cat
                    ? "bg-notion-text text-white"
                    : "text-notion-text-secondary hover:bg-notion-bg-hover"
                }`}
              >
                {cat === ""
                  ? t("adminDocuments.allCategories")
                  : t(`adminDocuments.categoryLabels.${cat}`)}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            <select
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              className="notion-input"
            >
              <option value="">{t("adminDocuments.allApplications")}</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.companyName}
                </option>
              ))}
            </select>

            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="notion-input"
            >
              <option value="">{t("adminDocuments.allFileTypes")}</option>
              <option value="application/pdf">PDF</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/png">PNG</option>
              <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">DOCX</option>
            </select>

            <div className="flex items-center gap-2">
              <label className="text-xs text-notion-text-secondary whitespace-nowrap">{t("adminDocuments.dateFrom")}</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="notion-input flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-notion-text-secondary whitespace-nowrap">{t("adminDocuments.dateTo")}</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="notion-input flex-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Documents Table */}
      <div className="border border-notion-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-notion-border bg-notion-bg-secondary">
                <th
                  onClick={() => toggleSort("fileName")}
                  className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider cursor-pointer select-none hover:text-notion-text"
                >
                  {t("adminDocuments.fileName")}
                  <SortIcon col="fileName" />
                </th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider">
                  {t("adminDocuments.application")}
                </th>
                <th
                  onClick={() => toggleSort("category")}
                  className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider cursor-pointer select-none hover:text-notion-text hidden md:table-cell"
                >
                  {t("adminDocuments.category")}
                  <SortIcon col="category" />
                </th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider hidden lg:table-cell">
                  {t("adminDocuments.uploadedBy")}
                </th>
                <th
                  onClick={() => toggleSort("createdAt")}
                  className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider cursor-pointer select-none hover:text-notion-text hidden sm:table-cell"
                >
                  {t("common.date")}
                  <SortIcon col="createdAt" />
                </th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-notion-border">
              {paginated.map((doc) => (
                <tr key={doc.id} className="hover:bg-notion-bg-hover transition-colors">
                  <td className="px-3 py-2.5 text-sm font-medium text-notion-text max-w-[200px] truncate" title={doc.fileName}>
                    {doc.fileName}
                  </td>
                  <td className="px-3 py-2.5 text-sm">
                    {doc.application ? (
                      <Link
                        href={`/admin/applications/${doc.application.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        {doc.application.companyName}
                      </Link>
                    ) : (
                      <span className="text-notion-text-secondary">{t("adminDocuments.noApplication")}</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 hidden md:table-cell">
                    <span className="text-xs text-notion-text-secondary">
                      {t(`adminDocuments.categoryLabels.${doc.category}`)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-sm text-notion-text-secondary hidden lg:table-cell">
                    {doc.user.name || doc.user.email}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-notion-text-secondary hidden sm:table-cell">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
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
          <div className="p-12 text-center">
            <p className="text-notion-text-secondary text-sm">{t("common.noData")}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-notion-text-secondary">
            {t("admin.table.showing")} {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, sorted.length)}{" "}
            {t("admin.table.of")} {sorted.length} {t("admin.table.entries")}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded-md text-sm border border-notion-border text-notion-text-secondary hover:bg-notion-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t("admin.table.previous")}
            </button>
            <span className="px-2.5 py-1 text-sm text-notion-text-secondary">
              {t("admin.table.page")} {page} {t("admin.table.of")} {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded-md text-sm border border-notion-border text-notion-text-secondary hover:bg-notion-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t("admin.table.next")}
            </button>
          </div>
        </div>
      )}

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
