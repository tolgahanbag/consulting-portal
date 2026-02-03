"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

interface CompanyDocument {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  category: string;
  createdAt: string;
}

interface CompanyRecord {
  id: string;
  companyName: string;
  registrationNumber: string;
  registrationDate: string;
  status: string;
  documents: CompanyDocument[];
}

export default function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { status } = useSession();
  const t = useTranslations();
  const router = useRouter();
  const [company, setCompany] = useState<CompanyRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch(`/api/company/${id}`)
        .then((r) => r.json())
        .then((data) => setCompany(data.company))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [status, id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500">{t("common.loading")}</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500">{t("common.noData")}</p>
      </div>
    );
  }

  const groupedDocs = company.documents.reduce<Record<string, CompanyDocument[]>>(
    (acc, doc) => {
      if (!acc[doc.category]) acc[doc.category] = [];
      acc[doc.category].push(doc);
      return acc;
    },
    {}
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{company.companyName}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">{t("company.registrationNumber")}</p>
          <p className="font-medium">{company.registrationNumber || "-"}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">{t("company.registrationDate")}</p>
          <p className="font-medium">
            {company.registrationDate
              ? new Date(company.registrationDate).toLocaleDateString()
              : "-"}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">{t("company.status")}</p>
          <p className={`font-medium ${company.status === "ACTIVE" ? "text-green-600" : "text-red-600"}`}>
            {company.status === "ACTIVE" ? t("company.active") : t("company.inactive")}
          </p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">{t("company.documents")}</h2>

      {Object.keys(groupedDocs).length === 0 ? (
        <p className="text-gray-500 text-sm">{t("common.noData")}</p>
      ) : (
        Object.entries(groupedDocs).map(([category, docs]) => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {t(`company.categories.${category}`)}
            </h3>
            <div className="bg-white rounded-xl border divide-y">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">{doc.fileName}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={doc.filePath}
                    download
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {t("common.download")}
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
