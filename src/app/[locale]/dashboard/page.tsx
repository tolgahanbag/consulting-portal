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
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500">{t("common.loading")}</p>
      </div>
    );
  }

  const user = session?.user as { name?: string } | undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("dashboard.title")}</h1>
        <p className="text-gray-600">
          {t("dashboard.welcome")}, {user?.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">
            {t("dashboard.activeApplications")}
          </h3>
          <p className="text-3xl font-bold text-blue-700 mt-2">
            {applications.filter((a) => a.status !== "COMPLETED").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">
            {t("dashboard.pendingQuotes")}
          </h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {applications.filter((a) => a.status === "QUOTED").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">
            {t("admin.completed")}
          </h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {applications.filter((a) => a.status === "COMPLETED").length}
          </p>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{t("dashboard.myApplications")}</h2>
          <Link
            href="/#apply"
            className="text-sm bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
          >
            {t("dashboard.newApplication")}
          </Link>
        </div>

        {applications.length === 0 ? (
          <p className="p-8 text-center text-gray-500">
            {t("dashboard.noApplications")}
          </p>
        ) : (
          <div className="divide-y">
            {applications.map((app) => (
              <Link
                key={app.id}
                href={`/dashboard/applications/${app.id}`}
                className="flex items-center justify-between p-6 hover:bg-gray-50 transition"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{app.companyName}</h3>
                  <p className="text-sm text-gray-500">
                    {app.companyType} &middot;{" "}
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    app.status === "NEW"
                      ? "bg-blue-100 text-blue-800"
                      : app.status === "QUOTED"
                      ? "bg-orange-100 text-orange-800"
                      : app.status === "ACCEPTED"
                      ? "bg-green-100 text-green-800"
                      : app.status === "IN_PROGRESS"
                      ? "bg-purple-100 text-purple-800"
                      : app.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {t(`application.status.${app.status}`)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
