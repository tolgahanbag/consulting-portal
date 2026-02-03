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
      <h3 className="font-display font-semibold text-navy-900 mb-4">
        {t("admin.notes.title")}
      </h3>

      {/* Inline add note form */}
      <form onSubmit={addNote} className="glass-card rounded-2xl p-4 mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder={t("admin.notes.placeholder")}
          className="w-full px-3 py-2 border border-navy-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            className="bg-navy-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-navy-800 transition-all duration-300"
          >
            {t("admin.addNote")}
          </button>
        </div>
      </form>

      {notes.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-navy-400 text-sm">{t("admin.notes.empty")}</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl divide-y divide-navy-100/30">
          {notes.map((n) => (
            <div key={n.id} className="p-4">
              <p className="text-sm text-navy-700">{n.content}</p>
              <p className="text-xs text-navy-300 mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
