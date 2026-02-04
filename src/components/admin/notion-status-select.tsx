"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { getNotionStatusColor } from "@/lib/status-utils";

const STATUSES = ["NEW", "IN_REVIEW", "QUOTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED"];

interface NotionStatusSelectProps {
  value: string;
  onChange: (status: string) => void;
}

export function NotionStatusSelect({ value, onChange }: NotionStatusSelectProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const statusColor = getNotionStatusColor(value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 text-sm font-medium px-2.5 py-1 rounded-md transition-colors hover:opacity-80 ${statusColor.bg} ${statusColor.text}`}
      >
        <span className={`w-2 h-2 rounded-full ${statusColor.dot}`} />
        {t(`application.status.${value}`)}
        <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-notion-border py-1 min-w-[180px] z-20">
          {STATUSES.map((s) => {
            const sc = getNotionStatusColor(s);
            return (
              <button
                key={s}
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-notion-bg-hover transition-colors ${
                  s === value ? "bg-notion-bg-hover" : ""
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                <span className="text-notion-text">{t(`application.status.${s}`)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
