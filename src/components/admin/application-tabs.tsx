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
    <div className="mb-6 border-b border-navy-100/50 overflow-x-auto">
      <div className="flex gap-0 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative px-4 py-3 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === tab.id
                ? "text-navy-900"
                : "text-navy-400 hover:text-navy-600"
            }`}
          >
            {t(`tabs.${tab.id}`)}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium rounded-full bg-navy-100 text-navy-600">
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-500 to-gold-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
