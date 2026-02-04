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

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "\uD83D\uDCC4";
  if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "\uD83D\uDDBC\uFE0F";
  if (["doc", "docx"].includes(ext)) return "\uD83D\uDCC3";
  return "\uD83D\uDCC1";
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
        <h3 className="text-sm font-semibold text-notion-text">
          {t("admin.tabs.documents")}
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          + {t("common.upload")}
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="notion-card p-8 text-center">
          <p className="text-notion-text-secondary text-sm">{t("common.noData")}</p>
        </div>
      ) : (
        <div className="border border-notion-border rounded-lg divide-y divide-notion-border">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between px-4 py-3 hover:bg-notion-bg-hover transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg flex-shrink-0">{getFileIcon(doc.fileName)}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-notion-text truncate">{doc.fileName}</p>
                  <p className="text-xs text-notion-text-secondary">
                    {doc.category} &middot; {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <a
                href={`/api/documents/${doc.id}/download`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors flex-shrink-0 ml-3"
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
            className="px-3 py-1.5 rounded-md text-sm text-notion-text-secondary border border-notion-border hover:bg-notion-bg-hover transition-colors"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleUpload}
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-notion-text text-white hover:bg-notion-text/90 transition-colors"
          >
            {t("common.upload")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
