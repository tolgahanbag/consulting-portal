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
            <label className="block text-sm font-medium text-navy-500 mb-1">
              {t("admin.quoteForm.amount")}
            </label>
            <input
              name="amount"
              type="number"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-500 mb-1">
              {t("admin.quoteForm.currency")}
            </label>
            <select
              name="currency"
              className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="TRY">TRY</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-500 mb-1">
              {t("admin.quoteForm.validUntil")}
            </label>
            <input
              name="validUntil"
              type="date"
              required
              className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-500 mb-1">
            {t("admin.quoteForm.description")}
          </label>
          <textarea
            name="description"
            rows={3}
            required
            className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
          />
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
            className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300 text-sm"
          >
            {t("admin.quoteForm.send")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
