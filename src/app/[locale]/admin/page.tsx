"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

interface Application {
  id: string;
  companyName: string;
  companyType: string;
  fullName: string;
  email: string;
  status: string;
  createdAt: string;
  _count: { documents: number };
}

function getStatusBadge(status: string) {
  switch (status) {
    case "NEW":
      return "badge-new";
    case "QUOTED":
      return "badge-quoted";
    case "ACCEPTED":
      return "badge-accepted";
    case "IN_PROGRESS":
      return "badge-progress";
    case "COMPLETED":
      return "badge-completed";
    default:
      return "badge-new";
  }
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const t = useTranslations();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] pt-[72px]">
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[100px]">
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
        {[
          { label: t("admin.totalApplications"), value: stats.total, color: "text-navy-900" },
          { label: t("admin.newApplications"), value: stats.new, color: "text-navy-600" },
          { label: t("admin.inProgress"), value: stats.inProgress, color: "text-gradient-gold" },
          { label: t("admin.completed"), value: stats.completed, color: "text-green-600" },
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
                <th className="text-left px-6 py-4 text-xs font-semibold text-navy-400 uppercase tracking-wider">
                  {t("common.name")}
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-navy-400 uppercase tracking-wider">
                  Şirket
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-navy-400 uppercase tracking-wider">
                  {t("common.email")}
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-navy-400 uppercase tracking-wider">
                  {t("common.status")}
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-navy-400 uppercase tracking-wider">
                  {t("common.date")}
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-navy-400 uppercase tracking-wider">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100/30">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-navy-50/30 transition-colors duration-200 group">
                  <td className="px-6 py-4 text-sm font-medium text-navy-900">{app.fullName}</td>
                  <td className="px-6 py-4 text-sm text-navy-600">{app.companyName}</td>
                  <td className="px-6 py-4 text-sm text-navy-400">{app.email}</td>
                  <td className="px-6 py-4">
                    <span className={getStatusBadge(app.status)}>
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
    </div>
  );
}
