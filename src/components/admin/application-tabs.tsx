"use client";

import { useTranslations } from "next-intl";
import type { TabId } from "@/types/admin";

interface Tab {
  id: TabId;
  count?: number;
}

interface ApplicationTabsProps {
  tabs: Tab[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function ApplicationTabs({ tabs, activeTab, onTabChange }: ApplicationTabsProps) {
  const t = useTranslations("admin");

  return (
    <div className="mb-6 border-b border-notion-border overflow-x-auto">
      <div className="flex gap-0 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative px-3 py-2 text-sm transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "text-notion-text font-medium"
                : "text-notion-text-secondary hover:text-notion-text"
            }`}
          >
            {t(`tabs.${tab.id}`)}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1 text-xs text-notion-text-secondary">
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-notion-text" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
