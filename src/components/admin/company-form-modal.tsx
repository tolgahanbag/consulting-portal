"use client";

import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/toaster";
import { Modal } from "./modal";

interface CompanyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  defaultCompanyName: string;
  onSuccess: () => void;
}

export function CompanyFormModal({ isOpen, onClose, applicationId, defaultCompanyName, onSuccess }: CompanyFormModalProps) {
  const t = useTranslations();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId,
        companyName: formData.get("companyName"),
        registrationNumber: formData.get("registrationNumber"),
        registrationDate: formData.get("registrationDate"),
      }),
    });
    if (res.ok) {
      toast(t("admin.toast.companyCreated"), "success");
      onSuccess();
    } else {
      toast(t("admin.toast.error"), "error");
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("admin.companyForm.title")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-notion-text-secondary mb-1">
              {t("admin.companyForm.companyName")}
            </label>
            <input name="companyName" required defaultValue={defaultCompanyName} className="notion-input" />
          </div>
          <div>
            <label className="block text-sm text-notion-text-secondary mb-1">
              {t("admin.companyForm.registrationNumber")}
            </label>
            <input name="registrationNumber" className="notion-input" />
          </div>
          <div>
            <label className="block text-sm text-notion-text-secondary mb-1">
              {t("admin.companyForm.registrationDate")}
            </label>
            <input name="registrationDate" type="date" className="notion-input" />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-sm text-notion-text-secondary border border-notion-border hover:bg-notion-bg-hover transition-colors"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            {t("common.save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
