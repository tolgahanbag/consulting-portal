"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/toaster";
import type { CompanyRecord } from "@/types/admin";
import { CompanyFormModal } from "./company-form-modal";
import { Modal } from "./modal";
import { FileUpload } from "./file-upload";

interface TabCompanyProps {
  companyRecord: CompanyRecord | null;
  applicationId: string;
  companyName: string;
  onRefresh: () => void;
}

export function TabCompany({ companyRecord, applicationId, companyName, onRefresh }: TabCompanyProps) {
  const t = useTranslations();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("REGISTRATION");
  const selectedFile = useRef<File | null>(null);

  async function handleUploadDocument() {
    const file = selectedFile.current;
    if (!file || !companyRecord) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", uploadCategory);
    const res = await fetch(`/api/company/${companyRecord.id}/documents`, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      toast(t("admin.toast.companyDocUploaded"), "success");
      setShowUploadModal(false);
      selectedFile.current = null;
      onRefresh();
    }
  }

  if (!companyRecord) {
    return (
      <div>
        <div className="notion-card p-8 text-center">
          <p className="text-notion-text-secondary text-sm mb-4">{t("admin.company.empty")}</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            {t("admin.companySetup")}
          </button>
        </div>
        <CompanyFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          applicationId={applicationId}
          defaultCompanyName={companyName}
          onSuccess={() => {
            setShowCreateModal(false);
            onRefresh();
          }}
        />
      </div>
    );
  }

  const properties = [
    { label: t("admin.company.companyName"), value: companyRecord.companyName },
    { label: t("company.registrationNumber"), value: companyRecord.registrationNumber || "-" },
    {
      label: t("company.registrationDate"),
      value: companyRecord.registrationDate
        ? new Date(companyRecord.registrationDate).toLocaleDateString()
        : "-",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-notion-text">{t("company.title")}</h3>
        <button
          onClick={() => setShowUploadModal(true)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          + {t("admin.company.uploadDocument")}
        </button>
      </div>

      {/* Company Properties */}
      <div className="notion-card mb-4">
        <div className="divide-y divide-notion-border">
          {properties.map((prop, idx) => (
            <div key={idx} className="flex py-2 text-sm">
              <span className="w-48 flex-shrink-0 text-notion-text-secondary">{prop.label}</span>
              <span className="text-notion-text">{prop.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Company Documents */}
      {companyRecord.documents.length > 0 && (
        <div className="border border-notion-border rounded-lg divide-y divide-notion-border">
          {companyRecord.documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between px-4 py-3 hover:bg-notion-bg-hover transition-colors">
              <div>
                <p className="text-sm font-medium text-notion-text">{doc.fileName}</p>
                <p className="text-xs text-notion-text-secondary">{t(`company.categories.${doc.category}`)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload document modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          selectedFile.current = null;
        }}
        title={t("admin.company.uploadDocument")}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-notion-text-secondary mb-1">
              {t("admin.company.selectCategory")}
            </label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="notion-input"
            >
              {["REGISTRATION", "TAX", "LICENSE", "OTHER"].map((cat) => (
                <option key={cat} value={cat}>
                  {t(`company.categories.${cat}`)}
                </option>
              ))}
            </select>
          </div>
          <FileUpload
            onFileSelect={(file) => {
              selectedFile.current = file;
            }}
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowUploadModal(false);
                selectedFile.current = null;
              }}
              className="px-3 py-1.5 rounded-md text-sm text-notion-text-secondary border border-notion-border hover:bg-notion-bg-hover transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleUploadDocument}
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-notion-text text-white hover:bg-notion-text/90 transition-colors"
            >
              {t("common.upload")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
