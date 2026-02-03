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

export function TabQuotes({ quotes, applicationId, onRefresh }: TabQuotesProps) {
  const t = useTranslations();
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-navy-900">
          {t("admin.tabs.quotes")}
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300"
        >
          {t("admin.sendQuote")}
        </button>
      </div>

      {quotes.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-navy-400 text-sm">{t("common.noData")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <div key={q.id} className="glass-card rounded-2xl p-4">
              <div className="flex justify-between items-center">
                <p className="font-display font-bold text-navy-900">
                  {q.amount} {q.currency}
                </p>
                <span
                  className={`text-xs px-2.5 py-1 rounded-xl font-medium ${
                    q.status === "ACCEPTED"
                      ? "bg-green-50 text-green-600 border border-green-200"
                      : q.status === "REJECTED"
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "bg-gold-50 text-gold-700 border border-gold-200"
                  }`}
                >
                  {q.status}
                </span>
              </div>
              <p className="text-sm text-navy-400 mt-1">{q.description}</p>
              {q.validUntil && (
                <p className="text-xs text-navy-300 mt-2">
                  {t("admin.quoteForm.validUntil")}: {new Date(q.validUntil).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
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
