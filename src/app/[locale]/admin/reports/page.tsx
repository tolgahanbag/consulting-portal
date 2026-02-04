"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

interface ReportData {
  overview: {
    totalApplications: number;
    totalQuotes: number;
    totalDocuments: number;
    totalUsers: number;
    adminUsers: number;
    recentApplications: number;
    recentQuotes: number;
    avgCompletionDays: number;
    conversionRate: number;
    totalQuoteAmount: number;
    acceptedQuoteAmount: number;
    bottleneckApps: number;
  };
  statusCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  quoteStatusCounts: Record<string, number>;
  workflowStatusCounts: Record<string, number>;
  monthlyApplications: Record<string, number>;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500",
  IN_REVIEW: "bg-yellow-500",
  QUOTED: "bg-purple-500",
  ACCEPTED: "bg-green-500",
  IN_PROGRESS: "bg-orange-500",
  COMPLETED: "bg-emerald-600",
  PENDING: "bg-gray-400",
  REJECTED: "bg-red-500",
};

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const t = useTranslations();
  const router = useRouter();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

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

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/reports");
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchData();
  }, [status, fetchData]);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-notion-border border-t-notion-text rounded-full animate-spin" />
          <p className="text-notion-text-secondary text-sm">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const { overview, statusCounts, typeCounts, quoteStatusCounts, workflowStatusCounts, monthlyApplications } = data;

  // Get max value for bar chart scaling
  const monthlyEntries = Object.entries(monthlyApplications).sort(([a], [b]) => a.localeCompare(b)).slice(-12);
  const maxMonthly = Math.max(...monthlyEntries.map(([, v]) => v), 1);

  function BarChart({ data, colorMap }: { data: Record<string, number>; colorMap: Record<string, string> }) {
    const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
    return (
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs text-notion-text-secondary w-24 truncate text-right">
              {t(`application.status.${key}`, { defaultValue: key })}
            </span>
            <div className="flex-1 h-5 bg-notion-bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${colorMap[key] || "bg-gray-400"}`}
                style={{ width: `${Math.max((value / total) * 100, 2)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-notion-text w-8 text-right">{value}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-notion-text mb-1">
        {t("reports.title")}
      </h1>
      <p className="text-notion-text-secondary text-sm mb-8">{t("reports.subtitle")}</p>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: t("reports.totalApplications"), value: overview.totalApplications },
          { label: t("reports.conversionRate"), value: `${overview.conversionRate}%` },
          { label: t("reports.avgCompletion"), value: overview.avgCompletionDays > 0 ? `${overview.avgCompletionDays} ${t("reports.days")}` : "—" },
          { label: t("reports.bottlenecks"), value: overview.bottleneckApps },
        ].map((stat, idx) => (
          <div key={idx} className="notion-card flex flex-col">
            <p className="text-xs text-notion-text-secondary uppercase tracking-wide mb-1">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-notion-text">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Financial + Activity Row */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="notion-card">
          <h3 className="text-sm font-semibold text-notion-text mb-4">{t("reports.financial")}</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-notion-text-secondary">{t("reports.totalQuoteValue")}</span>
              <span className="text-sm font-medium text-notion-text">
                {overview.totalQuoteAmount.toLocaleString()} EUR
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-notion-text-secondary">{t("reports.acceptedValue")}</span>
              <span className="text-sm font-medium text-green-600">
                {overview.acceptedQuoteAmount.toLocaleString()} EUR
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-notion-text-secondary">{t("reports.totalQuotes")}</span>
              <span className="text-sm font-medium text-notion-text">{overview.totalQuotes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-notion-text-secondary">{t("reports.totalDocuments")}</span>
              <span className="text-sm font-medium text-notion-text">{overview.totalDocuments}</span>
            </div>
          </div>
        </div>

        <div className="notion-card">
          <h3 className="text-sm font-semibold text-notion-text mb-4">{t("reports.last30Days")}</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-notion-text-secondary">{t("reports.newApplications")}</span>
              <span className="text-sm font-medium text-notion-text">{overview.recentApplications}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-notion-text-secondary">{t("reports.newQuotes")}</span>
              <span className="text-sm font-medium text-notion-text">{overview.recentQuotes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-notion-text-secondary">{t("reports.totalUsers")}</span>
              <span className="text-sm font-medium text-notion-text">{overview.totalUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-notion-text-secondary">{t("reports.adminCount")}</span>
              <span className="text-sm font-medium text-notion-text">{overview.adminUsers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {/* Application Status Distribution */}
        <div className="notion-card">
          <h3 className="text-sm font-semibold text-notion-text mb-4">{t("reports.statusDistribution")}</h3>
          <BarChart data={statusCounts} colorMap={STATUS_COLORS} />
        </div>

        {/* Quote Status Distribution */}
        <div className="notion-card">
          <h3 className="text-sm font-semibold text-notion-text mb-4">{t("reports.quoteDistribution")}</h3>
          <BarChart
            data={quoteStatusCounts}
            colorMap={{ PENDING: "bg-yellow-500", ACCEPTED: "bg-green-500", REJECTED: "bg-red-500" }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {/* Company Type Distribution */}
        <div className="notion-card">
          <h3 className="text-sm font-semibold text-notion-text mb-4">{t("reports.companyTypes")}</h3>
          <div className="space-y-2">
            {Object.entries(typeCounts).map(([type, count]) => {
              const total = Object.values(typeCounts).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xs text-notion-text-secondary w-24 truncate text-right">{type}</span>
                  <div className="flex-1 h-5 bg-notion-bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-notion-text w-12 text-right">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workflow Status */}
        <div className="notion-card">
          <h3 className="text-sm font-semibold text-notion-text mb-4">{t("reports.workflowStatus")}</h3>
          <BarChart
            data={workflowStatusCounts}
            colorMap={{ PENDING: "bg-gray-400", IN_PROGRESS: "bg-orange-500", COMPLETED: "bg-green-500" }}
          />
        </div>
      </div>

      {/* Monthly Trend */}
      {monthlyEntries.length > 0 && (
        <div className="notion-card mb-8">
          <h3 className="text-sm font-semibold text-notion-text mb-4">{t("reports.monthlyTrend")}</h3>
          <div className="flex items-end gap-2 h-40">
            {monthlyEntries.map(([month, count]) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-notion-text">{count}</span>
                <div
                  className="w-full bg-blue-500 rounded-t transition-all min-h-[4px]"
                  style={{ height: `${(count / maxMonthly) * 100}%` }}
                />
                <span className="text-[10px] text-notion-text-secondary whitespace-nowrap">
                  {month.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
