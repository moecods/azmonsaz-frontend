"use client";

import { Box, Button, Stack, TextField, Typography, IconButton } from "@mui/material";
import { Controller } from "react-hook-form";
import { Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragHandleIcon from "@mui/icons-material/DragHandle";
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
import type { TypeFormProps } from "./types";
import { getArrayFieldError, getNestedErrorMessage } from "./form-error-utils";
import { fieldPathToElementId } from "@/lib/form-errors";

function SortableOrderingRow({
  id,
  index,
  control,
  itemError,
  canDelete,
  onRemove,
}: {
  id: string;
  index: number;
  control: TypeFormProps["control"];
  itemError?: string;
  canDelete: boolean;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  return (
    <Stack
      ref={setNodeRef}
      direction="row"
      spacing={2}
      alignItems="center"
      id={fieldPathToElementId(`items.${index}.text`)}
      sx={{
        transform: CSS.Transform.toString(transform),
        transition,
        p: 1,
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
      }}
    >
      <Box {...attributes} {...listeners} sx={{ cursor: "grab", color: "text.secondary" }}>
        <DragHandleIcon fontSize="small" />
      </Box>
      <Chip size="small" label={index + 1} />
      <Controller
        name={`items.${index}.text`}
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={`مورد ${index + 1}`}
            fullWidth
            size="small"
            error={!!itemError}
            helperText={itemError}
          />
        )}
      />
      {canDelete && (
        <IconButton size="small" color="error" onClick={onRemove}>
          <DeleteIcon />
        </IconButton>
      )}
    </Stack>
  );
}

export function OrderingForm({
  control,
  errors,
  itemsFields,
  items,
  correct_order,
  setValue,
}: TypeFormProps) {
  const itemsError = getArrayFieldError(errors as never, "items");
  const orderError = getArrayFieldError(errors as never, "correct_order");
  const list = items ?? [];
  const ids = list.map((_, i) => `ord-${i}`);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    itemsFields.move(oldIndex, newIndex);
    setValue?.(
      "correct_order",
      arrayMove(
        (correct_order ?? list.map((_, i) => i)) as number[],
        oldIndex,
        newIndex
      )
    );
  };

  return (
    <Box id="field-items">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box component="span" sx={{ fontSize: "1rem", fontWeight: 500 }}>
          موارد — ترتیب لیست = ترتیب صحیح (بکشید و رها کنید)
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => {
            const len = list.length;
            itemsFields.append({ text: "", order: len });
            setValue?.("correct_order", [...((correct_order ?? []) as number[]), len]);
          }}
        >
          افزودن مورد
        </Button>
      </Stack>
      {itemsError && (
        <Typography variant="caption" color="error" display="block" sx={{ mb: 1 }}>
          {itemsError}
        </Typography>
      )}
      {orderError && (
        <Typography variant="caption" color="error" display="block" sx={{ mb: 1 }}>
          {orderError}
        </Typography>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <Stack spacing={1}>
            {list.map((_, index) => {
              const itemError = getNestedErrorMessage(errors as never, `items.${index}.text`);
              return (
                <SortableOrderingRow
                  key={itemsFields.fields[index]?.id ?? ids[index]}
                  id={ids[index]}
                  index={index}
                  control={control}
                  itemError={itemError}
                  canDelete={list.length > 2}
                  onRemove={() => {
                    itemsFields.remove(index);
                    const newOrder = list
                      .map((_, i) => i)
                      .filter((_, i) => i !== index);
                    setValue?.("correct_order", newOrder);
                  }}
                />
              );
            })}
          </Stack>
        </SortableContext>
      </DndContext>
    </Box>
  );
}
