"use client";


import { NotionStatusSelect } from "./notion-status-select";
import type { Application } from "@/types/admin";

interface ApplicationHeaderProps {
  app: Application;
  onStatusChange: (status: string) => void;
}

export function ApplicationHeader({ app, onStatusChange }: ApplicationHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-notion-text">{app.companyName}</h1>
          <p className="text-sm text-notion-text-secondary mt-1">
            {app.fullName} &middot; {app.email} &middot; {app.phone}
          </p>
          {app.description && (
            <p className="text-sm text-notion-text-secondary mt-1">{app.description}</p>
          )}
        </div>
        <NotionStatusSelect value={app.status} onChange={onStatusChange} />
      </div>
    </div>
  );
}
