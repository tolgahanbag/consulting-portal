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

const colorMap = {
  success: "bg-white border-green-200 text-green-700",
  error: "bg-white border-red-200 text-red-700",
  info: "bg-white border-notion-border text-notion-text",
};

const dotMap = {
  success: "bg-green-500",
  error: "bg-red-500",
  info: "bg-blue-500",
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
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-medium shadow-lg border animate-slide-in-right ${colorMap[t.type]}`}
        >
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotMap[t.type]}`} />
          {t.message}
        </div>
      ))}
    </div>
  );
}
