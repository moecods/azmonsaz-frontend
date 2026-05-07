"use client";

import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Switch,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import RichTextEditor from '@/components/editor/RichTextEditor';
import type { TypeFormProps } from './types';

interface OptionsFormProps extends TypeFormProps {
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
}

const OPTION_LETTERS = ['الف', 'ب', 'ج', 'د', 'ه', 'و', 'ز', 'ح'];

export function OptionsForm({
  control,
  errors,
  setValue,
  optionsFields,
  questionOptions,
  questionType,
  onAddOption,
  onRemoveOption,
}: OptionsFormProps) {
  const allowMultiple = questionType === 'multiple_select';
  const optionsError = (errors.options as { message?: string } | undefined)?.message;

  const setCorrect = (index: number, next: boolean) => {
    if (!setValue) return;
    if (!allowMultiple) {
      // Radio-like behavior: only this one stays correct.
      const len = optionsFields.fields.length;
      for (let i = 0; i < len; i++) {
        setValue(`options.${i}.is_correct`, i === index && next, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      if (next) setValue('correct_answer', index, { shouldDirty: true });
    } else {
      setValue(`options.${index}.is_correct`, next, { shouldDirty: true, shouldValidate: true });
      const indices = (questionOptions ?? [])
        .map((o, i) => (i === index ? next : Boolean(o?.is_correct)))
        .map((v, i) => (v ? i : -1))
        .filter((i) => i >= 0);
      setValue('correct_answer', indices, { shouldDirty: true });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = optionsFields.fields.findIndex((f) => f.id === active.id);
    const newIndex = optionsFields.fields.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    optionsFields.move(oldIndex, newIndex);
  };

  const correctCount = (questionOptions ?? []).filter((o) => o?.is_correct).length;

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            گزینه‌ها
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {allowMultiple
              ? `می‌توانید چند گزینه را به‌عنوان صحیح انتخاب کنید (${correctCount} انتخاب شده)`
              : `یک گزینه را به‌عنوان صحیح انتخاب کنید (${correctCount}/۱)`}
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddOption}
        >
          افزودن گزینه
        </Button>
      </Stack>

      {optionsError && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
          {optionsError}
        </Typography>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={optionsFields.fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <Stack spacing={1.25}>
            {optionsFields.fields.map((field, index) => (
              <SortableOption
                key={field.id}
                id={field.id}
                index={index}
                removable={optionsFields.fields.length > 2}
                onRemove={() => onRemoveOption(index)}
                control={control}
                errors={errors}
                allowMultiple={allowMultiple}
                questionOptions={questionOptions}
                onSetCorrect={setCorrect}
              />
            ))}
          </Stack>
        </SortableContext>
      </DndContext>
    </Box>
  );
}

function SortableOption({
  id,
  index,
  removable,
  onRemove,
  control,
  errors,
  allowMultiple,
  questionOptions,
  onSetCorrect,
}: {
  id: string;
  index: number;
  removable: boolean;
  onRemove: () => void;
  control: TypeFormProps['control'];
  errors: TypeFormProps['errors'];
  allowMultiple: boolean;
  questionOptions: TypeFormProps['questionOptions'];
  onSetCorrect: (index: number, next: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 'auto',
    opacity: isDragging ? 0.85 : 1,
  };

  const isCorrect = Boolean(questionOptions?.[index]?.is_correct);
  const fieldError = errors.options?.[index]?.text?.message;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={(theme) => ({
        display: 'flex',
        gap: 1,
        alignItems: 'stretch',
        borderRadius: 2,
        border: '1px solid',
        borderColor: isCorrect ? 'success.main' : 'divider',
        bgcolor: isCorrect ? alpha(theme.palette.success.main, 0.04) : 'background.paper',
        p: 1,
        transition: 'border-color 0.15s, background-color 0.15s',
        touchAction: 'manipulation',
      })}
    >
      <Stack alignItems="center" spacing={0.5} sx={{ pt: 0.5, minWidth: 36 }}>
        <Tooltip title="جابجایی" arrow>
          <IconButton
            size="small"
            ref={setActivatorNodeRef}
            sx={{ cursor: 'grab', color: 'text.disabled', '&:active': { cursor: 'grabbing' } }}
            aria-label="جابجایی گزینه"
            {...attributes}
            {...listeners}
          >
            <DragIndicatorIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Chip
          size="small"
          label={OPTION_LETTERS[index] ?? index + 1}
          sx={{ fontWeight: 600, minWidth: 32, height: 22 }}
        />
      </Stack>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Controller
          name={`options.${index}.text`}
          control={control}
          render={({ field: f }) => (
            <RichTextEditor
              value={f.value ?? ''}
              onChange={f.onChange}
              preset="minimal"
              placeholder={`متن گزینه ${OPTION_LETTERS[index] ?? index + 1}`}
              minHeight={48}
              ariaLabel={`گزینه ${index + 1}`}
            />
          )}
        />
        {fieldError && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
            {fieldError}
          </Typography>
        )}
      </Box>

      <Stack alignItems="center" spacing={0.5} sx={{ pt: 0.5, minWidth: 90 }}>
        <Controller
          name={`options.${index}.is_correct`}
          control={control}
          render={({ field: f }) =>
            allowMultiple ? (
              <Tooltip title={f.value ? 'صحیح' : 'علامت‌گذاری به‌عنوان صحیح'} arrow>
                <Switch
                  checked={Boolean(f.value)}
                  onChange={(e) => onSetCorrect(index, e.target.checked)}
                  color="success"
                />
              </Tooltip>
            ) : (
              <Tooltip title={f.value ? 'پاسخ صحیح' : 'علامت‌گذاری به‌عنوان صحیح'} arrow>
                <IconButton
                  onClick={() => onSetCorrect(index, !f.value)}
                  color={f.value ? 'success' : 'default'}
                  size="small"
                  aria-pressed={f.value ? 'true' : 'false'}
                >
                  {f.value ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                </IconButton>
              </Tooltip>
            )
          }
        />
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
          {isCorrect ? 'صحیح' : 'غلط'}
        </Typography>
        {removable && (
          <Tooltip title="حذف گزینه" arrow>
            <IconButton size="small" color="error" onClick={onRemove} aria-label="حذف گزینه">
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Box>
  );
}
