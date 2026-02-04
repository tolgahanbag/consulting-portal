"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "@/components/ui/toaster";
import { Modal } from "@/components/admin/modal";

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
  user: { name: string; email: string };
}

const TYPES = ["INFO", "QUOTE", "WORKFLOW", "DOCUMENT"];

export default function AdminNotificationsPage() {
  const { data: session, status } = useSession();
  const t = useTranslations();
  const router = useRouter();

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, unread: 0 });
  const [typeFilter, setTypeFilter] = useState("");
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    type: "INFO",
    targetRole: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const user = session?.user as { role?: string } | undefined;
      if (user?.role !== "ADMIN") router.push("/dashboard");
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, session, router]);

  const fetchNotifications = useCallback(async () => {
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    params.set("page", String(page));

    const res = await fetch(`/api/admin/notifications?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications || []);
      setTotalPages(data.totalPages || 1);
      setStats(data.stats || { total: 0, unread: 0 });
    }
    setLoading(false);
  }, [typeFilter, page]);

  useEffect(() => {
    if (status === "authenticated") {
      setLoading(true);
      fetchNotifications();
    }
  }, [status, fetchNotifications]);

  useEffect(() => {
    setPage(1);
  }, [typeFilter]);

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const res = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(broadcastForm),
    });
    if (res.ok) {
      const data = await res.json();
      toast(`${data.sent} ${t("adminNotifications.sentTo")}`, "success");
      setShowBroadcast(false);
      setBroadcastForm({ title: "", message: "", type: "INFO", targetRole: "" });
      fetchNotifications();
    } else {
      toast(t("adminNotifications.sendError"), "error");
    }
    setSending(false);
  }

  const typeColors: Record<string, string> = {
    INFO: "bg-blue-100 text-blue-700",
    QUOTE: "bg-purple-100 text-purple-700",
    WORKFLOW: "bg-orange-100 text-orange-700",
    DOCUMENT: "bg-green-100 text-green-700",
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-notion-border border-t-notion-text rounded-full animate-spin" />
          <p className="text-notion-text-secondary text-sm">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-bold text-notion-text">{t("adminNotifications.title")}</h1>
        <button
          onClick={() => setShowBroadcast(true)}
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-notion-text text-white hover:bg-notion-text/90 transition-colors"
        >
          {t("adminNotifications.broadcast")}
        </button>
      </div>
      <p className="text-notion-text-secondary text-sm mb-8">{t("adminNotifications.subtitle")}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8 max-w-md">
        <div className="notion-card flex flex-col">
          <p className="text-xs text-notion-text-secondary uppercase tracking-wide mb-1">{t("adminNotifications.total")}</p>
          <p className="text-2xl font-bold text-notion-text">{stats.total}</p>
        </div>
        <div className="notion-card flex flex-col">
          <p className="text-xs text-notion-text-secondary uppercase tracking-wide mb-1">{t("adminNotifications.unread")}</p>
          <p className="text-2xl font-bold text-notion-text">{stats.unread}</p>
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex gap-1.5 mb-6">
        <button
          onClick={() => setTypeFilter("")}
          className={`px-3 py-1.5 rounded-md text-sm transition-colors ${!typeFilter ? "bg-notion-text text-white" : "text-notion-text-secondary hover:bg-notion-bg-hover"}`}
        >
          {t("common.all")}
        </button>
        {TYPES.map((tp) => (
          <button
            key={tp}
            onClick={() => setTypeFilter(tp)}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${typeFilter === tp ? "bg-notion-text text-white" : "text-notion-text-secondary hover:bg-notion-bg-hover"}`}
          >
            {t(`adminNotifications.types.${tp}`)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-notion-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-notion-border bg-notion-bg-secondary">
                <th className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider">{t("common.date")}</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider">{t("adminNotifications.recipient")}</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider">{t("adminNotifications.type")}</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider">{t("adminNotifications.titleCol")}</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider hidden md:table-cell">{t("adminNotifications.message")}</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider">{t("adminNotifications.read")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-notion-border">
              {notifications.map((n) => (
                <tr key={n.id} className="hover:bg-notion-bg-hover transition-colors">
                  <td className="px-3 py-2.5 text-sm text-notion-text-secondary whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-notion-text">{n.user.name || n.user.email}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeColors[n.type] || "bg-gray-100 text-gray-700"}`}>
                      {t(`adminNotifications.types.${n.type}`)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-sm text-notion-text font-medium max-w-[200px] truncate">{n.title}</td>
                  <td className="px-3 py-2.5 text-sm text-notion-text-secondary max-w-[250px] truncate hidden md:table-cell">{n.message}</td>
                  <td className="px-3 py-2.5">
                    <span className={`w-2 h-2 rounded-full inline-block ${n.isRead ? "bg-gray-300" : "bg-blue-500"}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {notifications.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-notion-text-secondary text-sm">{t("common.noData")}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end mt-4">
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-2.5 py-1 rounded-md text-sm border border-notion-border text-notion-text-secondary hover:bg-notion-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{t("admin.table.previous")}</button>
            <span className="px-2.5 py-1 text-sm text-notion-text-secondary">{t("admin.table.page")} {page} {t("admin.table.of")} {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2.5 py-1 rounded-md text-sm border border-notion-border text-notion-text-secondary hover:bg-notion-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{t("admin.table.next")}</button>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      <Modal isOpen={showBroadcast} onClose={() => setShowBroadcast(false)} title={t("adminNotifications.broadcast")}>
        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-notion-text-secondary mb-1">{t("adminNotifications.titleCol")} *</label>
            <input type="text" required value={broadcastForm.title} onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })} className="notion-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-notion-text-secondary mb-1">{t("adminNotifications.message")} *</label>
            <textarea required rows={3} value={broadcastForm.message} onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })} className="notion-input w-full resize-y" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-notion-text-secondary mb-1">{t("adminNotifications.type")}</label>
              <select value={broadcastForm.type} onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })} className="notion-input w-full">
                {TYPES.map((tp) => (
                  <option key={tp} value={tp}>{t(`adminNotifications.types.${tp}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-notion-text-secondary mb-1">{t("adminNotifications.target")}</label>
              <select value={broadcastForm.targetRole} onChange={(e) => setBroadcastForm({ ...broadcastForm, targetRole: e.target.value })} className="notion-input w-full">
                <option value="">{t("adminNotifications.allUsers")}</option>
                <option value="CLIENT">{t("adminUsers.roles.CLIENT")}</option>
                <option value="ADMIN">{t("adminUsers.roles.ADMIN")}</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowBroadcast(false)} className="px-3 py-1.5 rounded-md text-sm text-notion-text-secondary border border-notion-border hover:bg-notion-bg-hover transition-colors">{t("common.cancel")}</button>
            <button type="submit" disabled={sending} className="px-3 py-1.5 rounded-md text-sm font-medium bg-notion-text text-white hover:bg-notion-text/90 disabled:opacity-50 transition-colors">
              {sending ? t("common.loading") : t("adminNotifications.send")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
