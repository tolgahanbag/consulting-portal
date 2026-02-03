"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { getStatusBadgeClass } from "@/lib/status-utils";
import type { ApplicationListItem } from "@/types/admin";

type SortKey = "fullName" | "companyName" | "email" | "status" | "createdAt";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;

export default function AdminPage() {
  const { data: session, status } = useSession();
  const t = useTranslations();
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

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

  async function fetchApplications() {
    const res = await fetch(`/api/applications?status=${filterStatus}`);
    if (res.ok) {
      const data = await res.json();
      setApplications(data.applications || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (status === "authenticated") {
      setLoading(true);
      fetchApplications();
    }
  }, [filterStatus]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
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

  const stats = {
    total: applications.length,
    new: applications.filter((a) => a.status === "NEW").length,
    inProgress: applications.filter((a) => a.status === "IN_PROGRESS").length,
    completed: applications.filter((a) => a.status === "COMPLETED").length,
  };

  const statCards = [
    {
      label: t("admin.totalApplications"),
      value: stats.total,
      color: "text-navy-900",
      icon: (
        <svg className="w-5 h-5 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: t("admin.newApplications"),
      value: stats.new,
      color: "text-navy-600",
      icon: (
        <svg className="w-5 h-5 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: t("admin.inProgress"),
      value: stats.inProgress,
      color: "text-gradient-gold",
      icon: (
        <svg className="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: t("admin.completed"),
      value: stats.completed,
      color: "text-green-600",
      icon: (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

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
        <h1 className="font-display text-3xl font-bold text-navy-900">{t("admin.title")}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {statCards.map((stat, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-5 text-center group hover:shadow-glass-lg transition-all duration-300">
            <div className="flex justify-center mb-2">{stat.icon}</div>
            <p className="text-xs font-medium text-navy-500 uppercase tracking-wide mb-2">
              {stat.label}
            </p>
            <p className={`text-3xl font-display font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {["all", "NEW", "IN_REVIEW", "QUOTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED"].map(
          (s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                filterStatus === s
                  ? "bg-navy-900 text-white shadow-lg"
                  : "bg-white text-navy-500 border border-navy-100 hover:border-navy-200 hover:text-navy-700"
              }`}
            >
              {s === "all" ? t("common.all") : t(`application.status.${s}`)}
            </button>
          )
        )}
      </div>

      {/* Applications Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-100/50">
                <th
                  onClick={() => toggleSort("fullName")}
                  className="text-left px-6 py-4 text-xs font-semibold text-navy-400 uppercase tracking-wider cursor-pointer select-none hover:text-navy-600"
                >
                  {t("common.name")}
                  <SortIcon col="fullName" />
                </th>
                <th
                  onClick={() => toggleSort("companyName")}
                  className="text-left px-6 py-4 text-xs font-semibold text-navy-400 uppercase tracking-wider cursor-pointer select-none hover:text-navy-600"
                >
                  {t("admin.table.company")}
                  <SortIcon col="companyName" />
                </th>
                <th
                  onClick={() => toggleSort("email")}
                  className="text-left px-6 py-4 text-xs font-semibold text-navy-400 uppercase tracking-wider cursor-pointer select-none hover:text-navy-600"
                >
                  {t("common.email")}
                  <SortIcon col="email" />
                </th>
                <th
                  onClick={() => toggleSort("status")}
                  className="text-left px-6 py-4 text-xs font-semibold text-navy-400 uppercase tracking-wider cursor-pointer select-none hover:text-navy-600"
                >
                  {t("common.status")}
                  <SortIcon col="status" />
                </th>
                <th
                  onClick={() => toggleSort("createdAt")}
                  className="text-left px-6 py-4 text-xs font-semibold text-navy-400 uppercase tracking-wider cursor-pointer select-none hover:text-navy-600"
                >
                  {t("common.date")}
                  <SortIcon col="createdAt" />
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-navy-400 uppercase tracking-wider">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100/30">
              {paginated.map((app) => (
                <tr key={app.id} className="hover:bg-navy-50/30 transition-colors duration-200 group">
                  <td className="px-6 py-4 text-sm font-medium text-navy-900">{app.fullName}</td>
                  <td className="px-6 py-4 text-sm text-navy-600">{app.companyName}</td>
                  <td className="px-6 py-4 text-sm text-navy-400">{app.email}</td>
                  <td className="px-6 py-4">
                    <span className={getStatusBadgeClass(app.status)}>
                      {t(`application.status.${app.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-navy-400">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/applications/${app.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-gold-600 hover:text-gold-700 transition-colors group/link"
                    >
                      {t("common.view")}
                      <svg className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {applications.length === 0 && (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-navy-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
    </div>
  );
}
