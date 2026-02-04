"use client";

import { useTranslations } from "next-intl";
import { Modal } from "./modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  variant?: "danger" | "default";
}

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  variant = "default",
}: ConfirmDialogProps) {
  const t = useTranslations("common");

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <p className="text-sm text-notion-text-secondary mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-md text-sm text-notion-text-secondary border border-notion-border hover:bg-notion-bg-hover transition-colors"
        >
          {t("cancel")}
        </button>
        <button
          onClick={onConfirm}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            variant === "danger"
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-notion-text text-white hover:bg-notion-text/90"
          }`}
        >
          {t("confirm")}
        </button>
      </div>
    </Modal>
  );
}
