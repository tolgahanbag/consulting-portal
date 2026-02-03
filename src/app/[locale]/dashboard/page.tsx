"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";

interface Application {
  id: string;
  companyName: string;
  companyType: string;
  status: string;
  createdAt: string;
  quotes: { id: string; status: string }[];
  workflows: { id: string; status: string }[];
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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const t = useTranslations();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/applications")
        .then((r) => r.json())
        .then((data) => setApplications(data.applications || []))
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] pt-[72px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-navy-200 border-t-gold-500 rounded-full animate-spin" />
          <p className="text-navy-400 text-sm">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const user = session?.user as { name?: string } | undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[100px]">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="gold-line" />
          <span className="text-gold-600 text-sm font-medium tracking-[0.15em] uppercase">
            {t("dashboard.title")}
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold text-navy-900">
          {t("dashboard.welcome")}, {user?.name}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="glass-card rounded-2xl p-6 group hover:shadow-glass-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-navy-500">
              {t("dashboard.activeApplications")}
            </h3>
            <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center group-hover:bg-gold-50 transition-colors duration-300">
              <svg className="w-5 h-5 text-navy-600 group-hover:text-gold-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-display font-bold text-navy-900">
            {applications.filter((a) => a.status !== "COMPLETED").length}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 group hover:shadow-glass-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-navy-500">
              {t("dashboard.pendingQuotes")}
            </h3>
            <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center group-hover:bg-gold-50 transition-colors duration-300">
              <svg className="w-5 h-5 text-navy-600 group-hover:text-gold-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-display font-bold text-gradient-gold">
            {applications.filter((a) => a.status === "QUOTED").length}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 group hover:shadow-glass-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-navy-500">
              {t("admin.completed")}
            </h3>
            <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center group-hover:bg-green-50 transition-colors duration-300">
              <svg className="w-5 h-5 text-navy-600 group-hover:text-green-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-display font-bold text-green-600">
            {applications.filter((a) => a.status === "COMPLETED").length}
          </p>
        </div>
      </div>

      {/* Applications List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-navy-100/50">
          <h2 className="font-display text-lg font-semibold text-navy-900">
            {t("dashboard.myApplications")}
          </h2>
          <Link
            href="/#apply"
            className="btn-primary !py-2 !px-5 !text-xs"
          >
            {t("dashboard.newApplication")}
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-navy-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-navy-400">{t("dashboard.noApplications")}</p>
          </div>
        ) : (
          <div className="divide-y divide-navy-100/50">
            {applications.map((app) => (
              <Link
                key={app.id}
                href={`/dashboard/applications/${app.id}`}
                className="flex items-center justify-between p-6 hover:bg-navy-50/50 transition-all duration-300 group"
              >
                <div>
                  <h3 className="font-semibold text-navy-900 group-hover:text-gold-700 transition-colors duration-300">
                    {app.companyName}
                  </h3>
                  <p className="text-sm text-navy-400 mt-1">
                    {app.companyType} &middot;{" "}
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={getStatusBadge(app.status)}>
                    {t(`application.status.${app.status}`)}
                  </span>
                  <svg className="w-4 h-4 text-navy-300 group-hover:text-gold-500 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
