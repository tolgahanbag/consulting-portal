"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

interface Document {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  category: string;
  createdAt: string;
  applicationId: string | null;
  user: { name: string | null; email: string };
  application: { id: string; companyName: string } | null;
}

interface Stats {
  total: number;
  applicationDoc: number;
  companyDoc: number;
  other: number;
}

interface AppOption {
  id: string;
  companyName: string;
}

export default function AdminDocumentsPage() {
  const { data: session, status } = useSession();
  const t = useTranslations();
  const router = useRouter();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, applicationDoc: 0, companyDoc: 0, other: 0 });
  const [applications, setApplications] = useState<AppOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [fileType, setFileType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Auth guard
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

  async function handleDelete(id: string) {
    if (!window.confirm(t("adminDocuments.deleteConfirm"))) return;

    const res = await fetch(`/api/admin/documents/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      // Refresh stats
      fetchDocuments();
    }
  }

  function formatFileType(mime: string) {
    if (mime.includes("pdf")) return "PDF";
    if (mime.includes("jpeg") || mime.includes("jpg")) return "JPEG";
    if (mime.includes("png")) return "PNG";
    if (mime.includes("wordprocessingml") || mime.includes("docx")) return "DOCX";
    return mime.split("/").pop()?.toUpperCase() || mime;
  }

  function getCategoryBadgeClass(cat: string) {
    switch (cat) {
      case "APPLICATION_DOC":
        return "bg-blue-100 text-blue-800";
      case "COMPANY_DOC":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {t("adminDocuments.title")}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <p className="text-sm text-gray-500">{t("adminDocuments.totalDocuments")}</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <p className="text-sm text-gray-500">{t("adminDocuments.applicationDocs")}</p>
          <p className="text-2xl font-bold text-blue-700">{stats.applicationDoc}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <p className="text-sm text-gray-500">{t("adminDocuments.companyDocs")}</p>
          <p className="text-2xl font-bold text-purple-700">{stats.companyDoc}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <p className="text-sm text-gray-500">{t("adminDocuments.otherDocs")}</p>
          <p className="text-2xl font-bold text-green-700">{stats.other}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("adminDocuments.searchPlaceholder")}
          className="w-full md:w-96 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Category pills */}
        <div className="flex gap-2 flex-wrap">
          {["", "APPLICATION_DOC", "COMPANY_DOC", "OTHER"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm ${
                category === cat
                  ? "bg-blue-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat === ""
                ? t("adminDocuments.allCategories")
                : t(`adminDocuments.categoryLabels.${cat}`)}
            </button>
          ))}
        </div>

        {/* Application dropdown */}
        <select
          value={applicationId}
          onChange={(e) => setApplicationId(e.target.value)}
          className="px-3 py-1 border rounded-lg text-sm bg-white"
        >
          <option value="">{t("adminDocuments.allApplications")}</option>
          {applications.map((app) => (
            <option key={app.id} value={app.id}>
              {app.companyName}
            </option>
          ))}
        </select>

        {/* File type dropdown */}
        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="px-3 py-1 border rounded-lg text-sm bg-white"
        >
          <option value="">{t("adminDocuments.allFileTypes")}</option>
          <option value="application/pdf">PDF</option>
          <option value="image/jpeg">JPEG</option>
          <option value="image/png">PNG</option>
          <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">DOCX</option>
        </select>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">{t("adminDocuments.dateFrom")}</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2 py-1 border rounded-lg text-sm"
          />
          <label className="text-sm text-gray-500">{t("adminDocuments.dateTo")}</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2 py-1 border rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  {t("adminDocuments.fileName")}
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  {t("adminDocuments.application")}
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  {t("adminDocuments.category")}
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  {t("adminDocuments.uploadedBy")}
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  {t("common.date")}
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  {t("adminDocuments.fileType")}
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium max-w-[200px] truncate" title={doc.fileName}>
                    {doc.fileName}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {doc.application ? (
                      <Link
                        href={`/admin/applications/${doc.application.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {doc.application.companyName}
                      </Link>
                    ) : (
                      <span className="text-gray-400">{t("adminDocuments.noApplication")}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeClass(doc.category)}`}
                    >
                      {t(`adminDocuments.categoryLabels.${doc.category}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {doc.user.name || doc.user.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatFileType(doc.fileType)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {t("common.download")}
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600 hover:underline text-sm"
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
          <p className="p-8 text-center text-gray-500">{t("common.noData")}</p>
        )}
      </div>
    </div>
  );
}
