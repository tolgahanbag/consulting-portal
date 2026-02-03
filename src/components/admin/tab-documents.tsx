"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/toaster";
import type { AppDocument } from "@/types/admin";
import { Modal } from "./modal";
import { FileUpload } from "./file-upload";

interface TabDocumentsProps {
  documents: AppDocument[];
  applicationId: string;
  onRefresh: () => void;
}

export function TabDocuments({ documents, applicationId, onRefresh }: TabDocumentsProps) {
  const t = useTranslations();
  const [showModal, setShowModal] = useState(false);
  const selectedFile = useRef<File | null>(null);

  async function handleUpload() {
    const file = selectedFile.current;
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("applicationId", applicationId);
    formData.append("category", "APPLICATION_DOC");
    const res = await fetch("/api/documents", { method: "POST", body: formData });
    if (res.ok) {
      toast(t("admin.toast.documentUploaded"), "success");
      setShowModal(false);
      selectedFile.current = null;
      onRefresh();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-navy-900">
          {t("admin.tabs.documents")}
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-navy-600 border border-navy-200 px-4 py-2 rounded-xl text-sm font-medium hover:border-navy-300 hover:text-navy-800 transition-all duration-300"
        >
          {t("common.upload")}
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-navy-400 text-sm">{t("common.noData")}</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl divide-y divide-navy-100/30">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-navy-50/30 transition-colors duration-200">
              <div>
                <p className="text-sm font-medium text-navy-900">{doc.fileName}</p>
                <p className="text-xs text-navy-300">
                  {doc.category} &middot; {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
              <a
                href={`/api/documents/${doc.id}/download`}
                className="text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors"
              >
                {t("common.download")}
              </a>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          selectedFile.current = null;
        }}
        title={t("common.upload")}
      >
        <FileUpload
          onFileSelect={(file) => {
            selectedFile.current = file;
          }}
        />
        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={() => {
              setShowModal(false);
              selectedFile.current = null;
            }}
            className="px-4 py-2 rounded-xl text-sm font-medium text-navy-600 border border-navy-200 hover:border-navy-300 transition-all duration-300"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleUpload}
            className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300"
          >
            {t("common.upload")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
