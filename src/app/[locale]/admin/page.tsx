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
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500">{t("common.loading")}</p>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t("admin.title")}</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <p className="text-sm text-gray-500">{t("admin.totalApplications")}</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <p className="text-sm text-gray-500">{t("admin.newApplications")}</p>
          <p className="text-2xl font-bold text-blue-700">{stats.new}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <p className="text-sm text-gray-500">{t("admin.inProgress")}</p>
          <p className="text-2xl font-bold text-purple-700">{stats.inProgress}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <p className="text-sm text-gray-500">{t("admin.completed")}</p>
          <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "NEW", "IN_REVIEW", "QUOTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED"].map(
          (s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-full text-sm ${
                filterStatus === s
                  ? "bg-blue-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "all" ? t("common.all") : t(`application.status.${s}`)}
            </button>
          )
        )}
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  {t("common.name")}
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  Şirket
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  {t("common.email")}
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  {t("common.status")}
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  {t("common.date")}
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{app.fullName}</td>
                  <td className="px-6 py-4 text-sm">{app.companyName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{app.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.status === "NEW"
                          ? "bg-blue-100 text-blue-800"
                          : app.status === "QUOTED"
                          ? "bg-orange-100 text-orange-800"
                          : app.status === "IN_PROGRESS"
                          ? "bg-purple-100 text-purple-800"
                          : app.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {t(`application.status.${app.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/applications/${app.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {t("common.view")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {applications.length === 0 && (
          <p className="p-8 text-center text-gray-500">{t("common.noData")}</p>
        )}
      </div>
    </div>
  );
}
