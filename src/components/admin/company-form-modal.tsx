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
            <label className="block text-sm font-medium text-navy-500 mb-1">
              {t("admin.companyForm.companyName")}
            </label>
            <input
              name="companyName"
              required
              defaultValue={defaultCompanyName}
              className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-500 mb-1">
              {t("admin.companyForm.registrationNumber")}
            </label>
            <input
              name="registrationNumber"
              className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-500 mb-1">
              {t("admin.companyForm.registrationDate")}
            </label>
            <input
              name="registrationDate"
              type="date"
              className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-navy-600 border border-navy-200 hover:border-navy-300 transition-all duration-300"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-green-700 transition-all duration-300 text-sm"
          >
            {t("common.save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
