"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { getNotionStatusColor } from "@/lib/status-utils";
import { NotionCheckbox } from "@/components/admin/notion-checkbox";
import { BulkActionsBar } from "@/components/admin/bulk-actions-bar";
import { KanbanBoard } from "@/components/admin/kanban";
import { DashboardWidget } from "@/components/admin/dashboard-widget";
import { useDashboardLayout } from "@/lib/hooks/use-dashboard-layout";
import type { ApplicationListItem } from "@/types/admin";

type SortKey = "fullName" | "companyName" | "email" | "status" | "createdAt";
type SortDir = "asc" | "desc";
type ViewMode = "table" | "board";

const PAGE_SIZE = 20;

export default function AdminPage() {
  const { data: session, status } = useSession();
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get("view") as ViewMode) || "table"
  );

  const { order, reorder, resetLayout } = useDashboardLayout();

  // Dashboard widget DnD sensors (distance: 10 to avoid accidental drags)
  const widgetSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } })
  );

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
  }, [filterStatus, sortKey, sortDir]);

  const sorted = useMemo(() => {
    const arr = [...applications];
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
  }, [applications, sortKey, sortDir]);

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

  // Kanban callbacks
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

  // Dashboard widget DnD handler
  function handleWidgetDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorder(active.id as string, over.id as string);
    }
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

  const stats = {
    total: applications.length,
    new: applications.filter((a) => a.status === "NEW").length,
    inProgress: applications.filter((a) => a.status === "IN_PROGRESS").length,
    completed: applications.filter((a) => a.status === "COMPLETED").length,
  };

  const statCards = [
    { label: t("admin.totalApplications"), value: stats.total },
    { label: t("admin.newApplications"), value: stats.new },
    { label: t("admin.inProgress"), value: stats.inProgress },
    { label: t("admin.completed"), value: stats.completed },
  ];

  // Widget content map
  const widgetContent: Record<string, React.ReactNode> = {
    stats: (
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
    ),
    content: (
      <>
        {/* Filter + View Toggle */}
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
      </>
    ),
  };

  return (
    <div>
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-notion-text mb-1">{t("admin.title")}</h1>
      <div className="flex items-center gap-3 mb-8">
        <p className="text-notion-text-secondary text-sm">
          {t("admin.applications")}
        </p>
        <button
          onClick={resetLayout}
          className="text-xs text-notion-text-secondary/50 hover:text-notion-text-secondary transition-colors ml-auto"
          title={t("admin.dashboard.layoutReset")}
        >
          {t("admin.dashboard.layoutReset")}
        </button>
      </div>

      {/* Draggable Widgets */}
      <DndContext
        sensors={widgetSensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleWidgetDragEnd}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="pl-6">
            {order.map((widgetId) => (
              <DashboardWidget key={widgetId} id={widgetId}>
                {widgetContent[widgetId]}
              </DashboardWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
