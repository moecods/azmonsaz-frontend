"use client";

import { useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Paper, Stack } from "@mui/material";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { RichLabel } from "@/components/editor";
import { optionText } from "@/lib/question-types/normalize-question";
import type { DisplaySettings } from "@/lib/question-types/display-settings";
import { mergeDisplaySettings } from "@/lib/question-types/display-settings";

function SortableItem({
  id,
  html,
  disabled,
}: {
  id: string;
  html: string;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });

  return (
    <Paper
      ref={setNodeRef}
      variant="outlined"
      sx={{
        p: 1.5,
        display: "flex",
        alignItems: "flex-start",
        gap: 1,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        cursor: disabled ? "default" : "grab",
      }}
    >
      {!disabled && (
        <Box {...attributes} {...listeners} sx={{ pt: 0.5, color: "text.secondary" }}>
          <DragHandleIcon fontSize="small" />
        </Box>
      )}
      <RichLabel html={html} fontSize="0.95rem" sx={{ flex: 1, minWidth: 0 }} />
    </Paper>
  );
}

interface OrderingAnswerInputProps {
  items: Array<string | { text?: string }>;
  value: number[] | undefined;
  onChange: (order: number[]) => void;
  disabled?: boolean;
  displaySettings?: DisplaySettings | Record<string, unknown>;
}

export default function OrderingAnswerInput({
  items,
  value,
  onChange,
  disabled,
  displaySettings,
}: OrderingAnswerInputProps) {
  const settings = mergeDisplaySettings(displaySettings as DisplaySettings);
  const itemIds = useMemo(() => items.map((_, i) => `item-${i}`), [items.length]);

  const order =
    value && value.length === items.length
      ? value
      : items.map((_, i) => i);

  const orderedIds = order.map((idx) => `item-${idx}`);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || disabled) return;
    const oldIndex = orderedIds.indexOf(String(active.id));
    const newIndex = orderedIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const newOrderedIds = arrayMove(orderedIds, oldIndex, newIndex);
    const newOrder = newOrderedIds.map((id) => parseInt(id.replace("item-", ""), 10));
    onChange(newOrder);
  };

  const layoutSx =
    settings.orderingLayout === "horizontal"
      ? { flexDirection: "row", flexWrap: "wrap" as const }
      : settings.orderingLayout === "grid"
        ? {
            display: "grid",
            gridTemplateColumns: `repeat(${settings.orderingColumns ?? 3}, 1fr)`,
            gap: 1,
          }
        : {};

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
        <Stack spacing={1} sx={layoutSx}>
          {orderedIds.map((id) => {
            const idx = parseInt(id.replace("item-", ""), 10);
            return (
              <SortableItem
                key={id}
                id={id}
                html={optionText(items[idx])}
                disabled={disabled}
              />
            );
          })}
        </Stack>
      </SortableContext>
    </DndContext>
  );
}
