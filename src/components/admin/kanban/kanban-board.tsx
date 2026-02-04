"use client";

import { useCallback, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import type { ApplicationListItem } from "@/types/admin";

const STATUSES = ["NEW", "IN_REVIEW", "QUOTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED"];

interface KanbanBoardProps {
  applications: ApplicationListItem[];
  onStatusChange: (id: string, newStatus: string) => void;
  onEditCard?: (id: string, data: { companyName?: string }) => void;
  onCreateCard?: (data: {
    companyName: string;
    fullName: string;
    email: string;
    phone: string;
    companyType: string;
    status: string;
  }) => void;
}

export function KanbanBoard({
  applications,
  onStatusChange,
  onEditCard,
  onCreateCard,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columnApps = useCallback(
    (status: string) => applications.filter((a) => a.status === status),
    [applications]
  );

  const activeApp = activeId
    ? applications.find((a) => a.id === activeId) || null
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const draggedApp = applications.find((a) => a.id === active.id);
    if (!draggedApp) return;

    let targetStatus: string | null = null;

    if (STATUSES.includes(over.id as string)) {
      targetStatus = over.id as string;
    } else {
      const overApp = applications.find((a) => a.id === over.id);
      if (overApp) targetStatus = overApp.status;
    }

    if (targetStatus && targetStatus !== draggedApp.status) {
      onStatusChange(draggedApp.id, targetStatus);
    }
  }

  function handleAddCard(status: string) {
    setAddingToColumn(status);
  }

  function handleCreateCard(data: {
    companyName: string;
    fullName: string;
    email: string;
    phone: string;
    companyType: string;
    status: string;
  }) {
    setAddingToColumn(null);
    onCreateCard?.(data);
  }

  function handleCancelAdd() {
    setAddingToColumn(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={columnApps(status)}
            onEditCard={onEditCard}
            showQuickAdd={addingToColumn === status}
            onAddCard={onCreateCard ? handleAddCard : undefined}
            onCreateCard={handleCreateCard}
            onCancelAdd={handleCancelAdd}
          />
        ))}
      </div>

      <DragOverlay>
        {activeApp ? (
          <div className="opacity-90 shadow-lg scale-105">
            <KanbanCard app={activeApp} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
