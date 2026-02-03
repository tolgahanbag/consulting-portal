"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export function NotificationDropdown() {
  const t = useTranslations("notifications");
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // silently fail
    }
  }

  async function markAllRead() {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-navy-500 hover:text-navy-700 hover:bg-navy-50 transition-all duration-300"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-gold-500 to-gold-400 text-navy-950 text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-pulse-gold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl shadow-glass-lg z-50 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-navy-100/50">
            <h3 className="font-display font-semibold text-sm text-navy-900">{t("title")}</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-gold-600 hover:text-gold-700 font-medium transition-colors"
              >
                {t("markAllRead")}
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-navy-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-sm text-navy-400">{t("noNotifications")}</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 border-b border-navy-100/30 last:border-b-0 hover:bg-navy-50/50 cursor-pointer transition-all duration-200 ${
                    !n.isRead ? "bg-gold-50/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                    )}
                    <div className={!n.isRead ? "" : "pl-5"}>
                      <p className="text-sm font-medium text-navy-900">{n.title}</p>
                      <p className="text-xs text-navy-500 mt-1 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-navy-400 mt-2">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
