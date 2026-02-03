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
      <p className="text-sm text-navy-500 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-medium text-navy-600 border border-navy-200 hover:border-navy-300 transition-all duration-300"
        >
          {t("cancel")}
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
            variant === "danger"
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 hover:shadow-lg"
          }`}
        >
          {t("confirm")}
        </button>
      </div>
    </Modal>
  );
}
