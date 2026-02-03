"use client";

import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/toaster";
import { Modal } from "./modal";

interface WorkflowFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  nextOrder: number;
  onSuccess: () => void;
}

export function WorkflowFormModal({ isOpen, onClose, applicationId, nextOrder, onSuccess }: WorkflowFormModalProps) {
  const t = useTranslations();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId,
        title: formData.get("title"),
        description: formData.get("description"),
        order: formData.get("order"),
      }),
    });
    if (res.ok) {
      toast(t("admin.toast.workflowAdded"), "success");
      onSuccess();
    } else {
      toast(t("admin.toast.error"), "error");
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("admin.workflowForm.title")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-navy-500 mb-1">
              {t("admin.workflowForm.stepTitle")}
            </label>
            <input
              name="title"
              required
              className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-500 mb-1">
              {t("admin.workflowForm.order")}
            </label>
            <input
              name="order"
              type="number"
              required
              defaultValue={nextOrder}
              className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-500 mb-1">
            {t("admin.workflowForm.stepDescription")}
          </label>
          <textarea
            name="description"
            rows={2}
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
            className="bg-navy-900 text-white px-6 py-2 rounded-xl font-medium hover:bg-navy-800 transition-all duration-300 text-sm"
          >
            {t("admin.addStep")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
