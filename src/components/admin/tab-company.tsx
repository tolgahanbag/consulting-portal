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
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-navy-400 text-sm mb-4">{t("admin.company.empty")}</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-all duration-300"
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-navy-900">{t("company.title")}</h3>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-all duration-300"
        >
          {t("admin.company.uploadDocument")}
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs font-medium text-navy-400 uppercase tracking-wide mb-1">
              {t("admin.company.companyName")}
            </p>
            <p className="text-sm font-medium text-navy-900">{companyRecord.companyName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-navy-400 uppercase tracking-wide mb-1">
              {t("company.registrationNumber")}
            </p>
            <p className="text-sm font-medium text-navy-900">{companyRecord.registrationNumber || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-navy-400 uppercase tracking-wide mb-1">
              {t("company.registrationDate")}
            </p>
            <p className="text-sm font-medium text-navy-900">
              {companyRecord.registrationDate
                ? new Date(companyRecord.registrationDate).toLocaleDateString()
                : "-"}
            </p>
          </div>
        </div>

        {companyRecord.documents.length > 0 && (
          <div className="border-t border-navy-100/30 pt-4 mt-4">
            <p className="text-xs font-medium text-navy-400 uppercase tracking-wide mb-3">
              {t("company.documents")}
            </p>
            <div className="space-y-2">
              {companyRecord.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-navy-50/50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-navy-900">{doc.fileName}</p>
                    <p className="text-xs text-navy-400">{t(`company.categories.${doc.category}`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
            <label className="block text-sm font-medium text-navy-500 mb-1">
              {t("admin.company.selectCategory")}
            </label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
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
              className="px-4 py-2 rounded-xl text-sm font-medium text-navy-600 border border-navy-200 hover:border-navy-300 transition-all duration-300"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleUploadDocument}
              className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300"
            >
              {t("common.upload")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
