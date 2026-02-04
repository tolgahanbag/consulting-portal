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
            <label className="block text-sm text-notion-text-secondary mb-1">
              {t("admin.workflowForm.stepTitle")}
            </label>
            <input name="title" required className="notion-input" />
          </div>
          <div>
            <label className="block text-sm text-notion-text-secondary mb-1">
              {t("admin.workflowForm.order")}
            </label>
            <input name="order" type="number" required defaultValue={nextOrder} className="notion-input" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-notion-text-secondary mb-1">
            {t("admin.workflowForm.stepDescription")}
          </label>
          <textarea name="description" rows={2} required className="notion-input resize-none" />
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
            {t("admin.addStep")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
