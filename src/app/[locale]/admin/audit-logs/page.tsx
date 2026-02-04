"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

interface AuditLog {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

const ACTIONS = ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"];
const ENTITIES = ["APPLICATION", "QUOTE", "WORKFLOW", "DOCUMENT", "USER", "COMPANY", "NOTE"];

export default function AuditLogsPage() {
  const { data: session, status } = useSession();
  const t = useTranslations();
  const router = useRouter();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (status === "authenticated") {
      const user = session?.user as { role?: string } | undefined;
      if (user?.role !== "ADMIN") {
        router.push("/dashboard");
      }
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, session, router]);

  const fetchLogs = useCallback(async () => {
    const params = new URLSearchParams();
    if (actionFilter) params.set("action", actionFilter);
    if (entityFilter) params.set("entity", entityFilter);
    if (debouncedSearch) params.set("search", debouncedSearch);
    params.set("page", String(page));

    const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    }
    setLoading(false);
  }, [actionFilter, entityFilter, debouncedSearch, page]);

  useEffect(() => {
    if (status === "authenticated") {
      setLoading(true);
      fetchLogs();
    }
  }, [status, fetchLogs]);

  useEffect(() => {
    setPage(1);
  }, [actionFilter, entityFilter, debouncedSearch]);

  const actionColors: Record<string, string> = {
    CREATE: "bg-green-100 text-green-700",
    UPDATE: "bg-blue-100 text-blue-700",
    DELETE: "bg-red-100 text-red-700",
    LOGIN: "bg-purple-100 text-purple-700",
    LOGOUT: "bg-gray-100 text-gray-700",
  };

  function formatDetails(details: string | null): Record<string, unknown> | null {
    if (!details) return null;
    try {
      return JSON.parse(details);
    } catch {
      return null;
    }
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
      <h1 className="text-3xl font-bold text-notion-text mb-1">
        {t("auditLogs.title")}
      </h1>
      <p className="text-notion-text-secondary text-sm mb-8">{t("auditLogs.subtitle")}</p>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-notion-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("auditLogs.searchPlaceholder")}
            className="notion-input pl-10"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="notion-input"
        >
          <option value="">{t("auditLogs.allActions")}</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {t(`auditLogs.actions.${a}`)}
            </option>
          ))}
        </select>
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="notion-input"
        >
          <option value="">{t("auditLogs.allEntities")}</option>
          {ENTITIES.map((e) => (
            <option key={e} value={e}>
              {t(`auditLogs.entities.${e}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <p className="text-xs text-notion-text-secondary mb-4">
        {t("admin.table.showing")} {logs.length} {t("admin.table.of")} {total} {t("admin.table.entries")}
      </p>

      {/* Logs Table */}
      <div className="border border-notion-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-notion-border bg-notion-bg-secondary">
                <th className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider">
                  {t("common.date")}
                </th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider">
                  {t("auditLogs.user")}
                </th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider">
                  {t("auditLogs.action")}
                </th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider">
                  {t("auditLogs.entity")}
                </th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider hidden md:table-cell">
                  {t("auditLogs.details")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-notion-border">
              {logs.map((log) => {
                const details = formatDetails(log.details);
                return (
                  <tr
                    key={log.id}
                    className="hover:bg-notion-bg-hover transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    <td className="px-3 py-2.5 text-sm text-notion-text-secondary whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-notion-text">
                      {log.userName || log.userId?.slice(0, 8) || "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${actionColors[log.action] || "bg-gray-100 text-gray-700"}`}>
                        {t(`auditLogs.actions.${log.action}`)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-notion-text-secondary">
                      {t(`auditLogs.entities.${log.entity}`)}
                      {log.entityId && (
                        <span className="ml-1 text-[10px] text-notion-text-secondary/60">
                          {log.entityId.slice(0, 8)}...
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-notion-text-secondary hidden md:table-cell">
                      {expandedId === log.id && details ? (
                        <pre className="text-xs bg-notion-bg-secondary p-2 rounded max-w-md overflow-auto whitespace-pre-wrap">
                          {JSON.stringify(details, null, 2)}
                        </pre>
                      ) : details ? (
                        <span className="text-xs text-notion-text-secondary/60">
                          {Object.keys(details).join(", ")}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-notion-text-secondary text-sm">{t("common.noData")}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end mt-4">
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
    </div>
  );
}
