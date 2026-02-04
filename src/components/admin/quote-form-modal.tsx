"use client";

import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/toaster";
import { Modal } from "./modal";

interface QuoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  onSuccess: () => void;
}

export function QuoteFormModal({ isOpen, onClose, applicationId, onSuccess }: QuoteFormModalProps) {
  const t = useTranslations();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId,
        amount: formData.get("amount"),
        currency: formData.get("currency"),
        description: formData.get("description"),
        validUntil: formData.get("validUntil"),
      }),
    });
    if (res.ok) {
      toast(t("admin.toast.quoteSent"), "success");
      onSuccess();
    } else {
      toast(t("admin.toast.error"), "error");
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("admin.quoteForm.title")} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-notion-text-secondary mb-1">
              {t("admin.quoteForm.amount")}
            </label>
            <input name="amount" type="number" step="0.01" required className="notion-input" />
          </div>
          <div>
            <label className="block text-sm text-notion-text-secondary mb-1">
              {t("admin.quoteForm.currency")}
            </label>
            <select name="currency" className="notion-input">
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="TRY">TRY</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-notion-text-secondary mb-1">
              {t("admin.quoteForm.validUntil")}
            </label>
            <input name="validUntil" type="date" required className="notion-input" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-notion-text-secondary mb-1">
            {t("admin.quoteForm.description")}
          </label>
          <textarea name="description" rows={3} required className="notion-input resize-none" />
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
            className="px-4 py-1.5 rounded-md text-sm font-medium bg-notion-text text-white hover:bg-notion-text/90 transition-colors"
          >
            {t("admin.quoteForm.send")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
