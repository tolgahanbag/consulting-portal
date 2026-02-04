"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

interface DashboardWidgetProps {
  id: string;
  children: ReactNode;
}

export function DashboardWidget({ id, children }: DashboardWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative group">
      {/* Drag Handle */}
      <div
        ref={setActivatorNodeRef}
        {...listeners}
        className="absolute -left-6 top-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 z-10"
        aria-label="Drag to reorder"
      >
        <svg className="w-4 h-4 text-notion-text-secondary" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
      </div>
      {children}
    </div>
  );
}
