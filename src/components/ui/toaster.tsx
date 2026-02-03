"use client";

import { useEffect, useState } from "react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

let listeners: ((toasts: Toast[]) => void)[] = [];
let toastQueue: Toast[] = [];

export function toast(message: string, type: Toast["type"] = "info") {
  const id = Math.random().toString(36).slice(2);
  const newToast: Toast = { id, message, type };
  toastQueue = [...toastQueue, newToast];
  listeners.forEach((l) => l(toastQueue));
  setTimeout(() => {
    toastQueue = toastQueue.filter((t) => t.id !== id);
    listeners.forEach((l) => l(toastQueue));
  }, 4000);
}

const iconMap = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const colorMap = {
  success: "bg-green-600 border-green-500",
  error: "bg-red-600 border-red-500",
  info: "bg-navy-800 border-navy-700",
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-xl px-5 py-3.5 text-white text-sm font-medium shadow-glass-lg border animate-slide-in-right backdrop-blur-sm ${colorMap[t.type]}`}
        >
          <span className="opacity-80">{iconMap[t.type]}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
