"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { getNotionStatusColor } from "@/lib/status-utils";
import { NotionCheckbox } from "@/components/admin/notion-checkbox";
import { BulkActionsBar } from "@/components/admin/bulk-actions-bar";
import { KanbanBoard } from "@/components/admin/kanban";
import type { ApplicationListItem } from "@/types/admin";

type SortKey = "fullName" | "companyName" | "email" | "status" | "createdAt";
type SortDir = "asc" | "desc";
type ViewMode = "table" | "board";

const PAGE_SIZE = 20;

export default function ApplicationsPage() {
  const { data: session, status } = useSession();
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [companyTypeFilter, setCompanyTypeFilter] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get("view") as ViewMode) || "table"
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (status === "authenticated") {
      const user = session?.user as { role?: string } | undefined;
      if (user?.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }
      fetchApplications();
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, session, router]);

  const fetchApplications = useCallback(async () => {
    const res = await fetch(`/api/applications?status=${filterStatus}`);
    if (res.ok) {
      const data = await res.json();
      setApplications(data.applications || []);
    }
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => {
    if (status === "authenticated") {
      setLoading(true);
      fetchApplications();
    }
  }, [filterStatus, status, fetchApplications]);

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [filterStatus, sortKey, sortDir, debouncedSearch, companyTypeFilter, dateFrom, dateTo]);

  const sorted = useMemo(() => {
    let arr = [...applications];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      arr = arr.filter(
        (a) =>
          a.fullName.toLowerCase().includes(q) ||
          a.companyName.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q)
      );
    }

    if (companyTypeFilter) {
      arr = arr.filter((a) => a.companyType === companyTypeFilter);
    }

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      arr = arr.filter((a) => new Date(a.createdAt).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 86400000;
      arr = arr.filter((a) => new Date(a.createdAt).getTime() <= to);
    }

    arr.sort((a, b) => {
      let av = a[sortKey] as string;
      let bv = b[sortKey] as string;
      if (sortKey === "createdAt") {
        return sortDir === "asc"
          ? new Date(av).getTime() - new Date(bv).getTime()
          : new Date(bv).getTime() - new Date(av).getTime();
      }
      av = (av || "").toLowerCase();
      bv = (bv || "").toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [applications, sortKey, sortDir, debouncedSearch, companyTypeFilter, dateFrom, dateTo]);

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

  function toggleSelectAll() {
    if (selectedIds.length === paginated.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map((a) => a.id));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleStatusChange(id: string, newStatus: string) {
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchApplications();
  }

  async function handleEditCard(id: string, data: { companyName?: string }) {
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchApplications();
  }

  async function handleCreateCard(data: {
    companyName: string;
    fullName: string;
    email: string;
    phone: string;
    companyType: string;
    status: string;
  }) {
    await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchApplications();
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col)
      return <span className="text-notion-text-secondary/50 ml-1">&#8597;</span>;
    return (
      <span className="text-notion-text ml-1">
        {sortDir === "asc" ? "\u2191" : "\u2193"}
      </span>
    );
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
      <h1 className="text-3xl font-bold text-notion-text mb-1">{t("admin.applications")}</h1>
      <p className="text-notion-text-secondary text-sm mb-8">
        {applications.length} {t("admin.totalApplications").toLowerCase()}
      </p>

      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-notion-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("admin.searchPlaceholder")}
            className="notion-input pl-10"
          />
        </div>
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`px-3 py-2 rounded-md text-sm transition-colors border ${
            showAdvancedFilters
              ? "bg-notion-text text-white border-notion-text"
              : "text-notion-text-secondary border-notion-border hover:bg-notion-bg-hover"
          }`}
        >
          {t("common.filter")}
          <svg className={`w-3 h-3 ml-1 inline-block transition-transform ${showAdvancedFilters ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="notion-card mb-4 animate-fade-up">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-notion-text-secondary mb-1">{t("admin.companyType")}</label>
              <select value={companyTypeFilter} onChange={(e) => setCompanyTypeFilter(e.target.value)} className="notion-input w-full">
                <option value="">{t("common.all")}</option>
                <option value="limited">{t("applicationForm.companyTypes.limited")}</option>
                <option value="anonim">{t("applicationForm.companyTypes.anonim")}</option>
                <option value="sahis">{t("applicationForm.companyTypes.sahis")}</option>
                <option value="sube">{t("applicationForm.companyTypes.sube")}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-notion-text-secondary mb-1">{t("admin.dateFrom")}</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="notion-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-notion-text-secondary mb-1">{t("admin.dateTo")}</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="notion-input w-full" />
            </div>
          </div>
        </div>
      )}

      {/* Status Filter + View Toggle */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {["all", "NEW", "IN_REVIEW", "QUOTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED"].map(
            (s) => {
              const isActive = filterStatus === s;
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-notion-text text-white"
                      : "text-notion-text-secondary hover:bg-notion-bg-hover"
                  }`}
                >
                  {s === "all" ? t("common.all") : t(`application.status.${s}`)}
                </button>
              );
            }
          )}
        </div>

        {/* View Toggle */}
        <div className="flex border border-notion-border rounded-md overflow-hidden">
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${
              viewMode === "table" ? "bg-notion-bg-hover text-notion-text" : "text-notion-text-secondary hover:bg-notion-bg-hover"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18M3 6h18M3 18h18" />
            </svg>
            {t("admin.viewToggle.table")}
          </button>
          <button
            onClick={() => setViewMode("board")}
            className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors border-l border-notion-border ${
              viewMode === "board" ? "bg-notion-bg-hover text-notion-text" : "text-notion-text-secondary hover:bg-notion-bg-hover"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
            {t("admin.viewToggle.board")}
          </button>
        </div>
      </div>

      {/* Board View */}
      {viewMode === "board" && (
        <KanbanBoard
          applications={applications}
          onStatusChange={handleStatusChange}
          onEditCard={handleEditCard}
          onCreateCard={handleCreateCard}
        />
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <>
          <div className="border border-notion-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-notion-border bg-notion-bg-secondary">
                    <th className="w-10 px-3 py-2.5">
                      <NotionCheckbox
                        checked={paginated.length > 0 && selectedIds.length === paginated.length}
                        indeterminate={selectedIds.length > 0 && selectedIds.length < paginated.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th
                      onClick={() => toggleSort("fullName")}
                      className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider cursor-pointer select-none hover:text-notion-text"
                    >
                      {t("common.name")}
                      <SortIcon col="fullName" />
                    </th>
                    <th
                      onClick={() => toggleSort("companyName")}
                      className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider cursor-pointer select-none hover:text-notion-text"
                    >
                      {t("admin.table.company")}
                      <SortIcon col="companyName" />
                    </th>
                    <th
                      onClick={() => toggleSort("email")}
                      className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider cursor-pointer select-none hover:text-notion-text hidden md:table-cell"
                    >
                      {t("common.email")}
                      <SortIcon col="email" />
                    </th>
                    <th
                      onClick={() => toggleSort("status")}
                      className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider cursor-pointer select-none hover:text-notion-text"
                    >
                      {t("common.status")}
                      <SortIcon col="status" />
                    </th>
                    <th
                      onClick={() => toggleSort("createdAt")}
                      className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider cursor-pointer select-none hover:text-notion-text hidden sm:table-cell"
                    >
                      {t("common.date")}
                      <SortIcon col="createdAt" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-notion-border">
                  {paginated.map((app) => {
                    const statusColor = getNotionStatusColor(app.status);
                    const isSelected = selectedIds.includes(app.id);
                    return (
                      <tr
                        key={app.id}
                        className={`hover:bg-notion-bg-hover transition-colors cursor-pointer ${
                          isSelected ? "bg-blue-50" : ""
                        }`}
                        onClick={() => router.push(`/admin/applications/${app.id}`)}
                      >
                        <td className="w-10 px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <NotionCheckbox
                            checked={isSelected}
                            onChange={() => toggleSelect(app.id)}
                          />
                        </td>
                        <td className="px-3 py-2.5 text-sm font-medium text-notion-text">
                          {app.fullName}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-notion-text">
                          {app.companyName}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-notion-text-secondary hidden md:table-cell">
                          {app.email}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded ${statusColor.bg} ${statusColor.text}`}>
                            <span className={`w-2 h-2 rounded-full ${statusColor.dot}`} />
                            {t(`application.status.${app.status}`)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-sm text-notion-text-secondary hidden sm:table-cell">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {applications.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-notion-text-secondary text-sm">{t("common.noData")}</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-notion-text-secondary">
                {t("admin.table.showing")} {(page - 1) * PAGE_SIZE + 1}-
                {Math.min(page * PAGE_SIZE, sorted.length)} {t("admin.table.of")}{" "}
                {sorted.length} {t("admin.table.entries")}
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
        </>
      )}

      {/* Bulk Actions */}
      <BulkActionsBar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds([])}
        onRefresh={fetchApplications}
      />
    </div>
  );
}
