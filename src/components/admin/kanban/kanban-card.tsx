"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "@/i18n/navigation";
import type { ApplicationListItem } from "@/types/admin";
import { KanbanCardPeek } from "./kanban-card-peek";

interface KanbanCardProps {
  app: ApplicationListItem;
  onEdit?: (id: string, data: { companyName?: string }) => void;
}

export function KanbanCard({ app, onEdit }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id, data: { status: app.status } });

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(app.companyName);
  const [showPeek, setShowPeek] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function handleDoubleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      setEditValue(app.companyName);
      setEditing(true);
    }
  }

  function commitEdit() {
    setEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== app.companyName && onEdit) {
      onEdit(app.id, { companyName: trimmed });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      commitEdit();
    } else if (e.key === "Escape") {
      setEditing(false);
      setEditValue(app.companyName);
    }
  }

  function handleMouseEnter() {
    hoverTimer.current = setTimeout(() => setShowPeek(true), 500);
  }

  function handleMouseLeave() {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    setShowPeek(false);
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="notion-card p-3 group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Drag Handle */}
      <div
        ref={setActivatorNodeRef}
        {...listeners}
        className="absolute left-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1"
        aria-label="Drag handle"
      >
        <svg className="w-3.5 h-3.5 text-notion-text-secondary" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
      </div>

      <div className="pl-4">
        {editing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="text-sm font-medium text-notion-text bg-transparent border-b border-blue-400 outline-none w-full"
          />
        ) : (
          <Link
            href={`/admin/applications/${app.id}`}
            className="block"
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className="text-sm font-medium text-notion-text truncate"
              onDoubleClick={handleDoubleClick}
            >
              {app.companyName}
            </p>
            <p className="text-xs text-notion-text-secondary mt-0.5 truncate">
              {app.fullName}
            </p>
            <p className="text-xs text-notion-text-secondary mt-1">
              {new Date(app.createdAt).toLocaleDateString()}
            </p>
          </Link>
        )}
      </div>

      {/* Peek Popover */}
      {showPeek && !isDragging && !editing && (
        <KanbanCardPeek app={app} />
      )}
    </div>
  );
}
