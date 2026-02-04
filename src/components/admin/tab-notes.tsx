"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/toaster";
import type { ApplicationNote } from "@/types/admin";

interface TabNotesProps {
  notes: ApplicationNote[];
  applicationId: string;
  onRefresh: () => void;
}

export function TabNotes({ notes, applicationId, onRefresh }: TabNotesProps) {
  const t = useTranslations();
  const [content, setContent] = useState("");

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    const res = await fetch(`/api/applications/${applicationId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      toast(t("admin.toast.noteAdded"), "success");
      setContent("");
      onRefresh();
    }
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-notion-text mb-4">
        {t("admin.notes.title")}
      </h3>

      {/* Add note */}
      <form onSubmit={addNote} className="notion-card mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder={t("admin.notes.placeholder")}
          className="notion-input resize-none"
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-notion-text text-white hover:bg-notion-text/90 transition-colors"
          >
            {t("admin.addNote")}
          </button>
        </div>
      </form>

      {notes.length === 0 ? (
        <div className="notion-card p-8 text-center">
          <p className="text-notion-text-secondary text-sm">{t("admin.notes.empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="notion-card">
              <p className="text-sm text-notion-text whitespace-pre-wrap">{n.content}</p>
              <p className="text-xs text-notion-text-secondary mt-2">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
