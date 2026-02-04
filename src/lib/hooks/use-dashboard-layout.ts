"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "admin-dashboard-layout";
const DEFAULT_ORDER = ["stats", "content"];

export function useDashboardLayout() {
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === DEFAULT_ORDER.length) {
          setOrder(parsed);
        }
      }
    } catch {
      // ignore malformed localStorage
    }
  }, []);

  const persist = useCallback((newOrder: string[]) => {
    setOrder(newOrder);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
    } catch {
      // localStorage unavailable
    }
  }, []);

  const reorder = useCallback(
    (activeId: string, overId: string) => {
      const oldIndex = order.indexOf(activeId);
      const newIndex = order.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const newOrder = [...order];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, activeId);
      persist(newOrder);
    },
    [order, persist]
  );

  const resetLayout = useCallback(() => {
    persist(DEFAULT_ORDER);
  }, [persist]);

  return { order, reorder, resetLayout };
}
