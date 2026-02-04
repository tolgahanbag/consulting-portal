"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Quote } from "@/types/admin";
import { QuoteFormModal } from "./quote-form-modal";

interface TabQuotesProps {
  quotes: Quote[];
  applicationId: string;
  onRefresh: () => void;
}

function getQuoteStatusColor(status: string) {
  switch (status) {
    case "ACCEPTED":
      return { dot: "bg-green-500", bg: "bg-green-50", text: "text-green-700" };
    case "REJECTED":
      return { dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700" };
    default:
      return { dot: "bg-yellow-500", bg: "bg-yellow-50", text: "text-yellow-700" };
  }
}

export function TabQuotes({ quotes, applicationId, onRefresh }: TabQuotesProps) {
  const t = useTranslations();
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-notion-text">
          {t("admin.tabs.quotes")}
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          + {t("admin.sendQuote")}
        </button>
      </div>

      {quotes.length === 0 ? (
        <div className="notion-card p-8 text-center">
          <p className="text-notion-text-secondary text-sm">{t("common.noData")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {quotes.map((q) => {
            const sc = getQuoteStatusColor(q.status);
            return (
              <div key={q.id} className="notion-card">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-notion-text">
                    {q.amount} {q.currency}
                  </p>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded ${sc.bg} ${sc.text}`}>
                    <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                    {q.status}
                  </span>
                </div>
                <p className="text-sm text-notion-text-secondary mt-1">{q.description}</p>
                {q.validUntil && (
                  <p className="text-xs text-notion-text-secondary mt-2">
                    {t("admin.quoteForm.validUntil")}: {new Date(q.validUntil).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <QuoteFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        applicationId={applicationId}
        onSuccess={() => {
          setShowModal(false);
          onRefresh();
        }}
      />
    </div>
  );
}
