"use client";

import React, { useId } from 'react';
import { FormControl, InputLabel, Select, SelectProps, MenuItem, FormHelperText } from '@mui/material';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { styled } from '@mui/material/styles';

function hasSelectValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

function valuesMatch(a: unknown, b: unknown): boolean {
  return String(a) === String(b);
}

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
  },
}));

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps<T extends FieldValues> extends Omit<SelectProps, 'name' | 'control' | 'children'> {
  /**
   * Field name (from react-hook-form)
   */
  name: FieldPath<T>;
  /**
   * React Hook Form control
   */
  control: Control<T>;
  /**
   * Label text
   */
  label: string;
  /**
   * Select options
   */
  options: SelectOption[];
  /**
   * Helper text
   */
  helperText?: string;
  /**
   * Show error state
   */
  error?: boolean;
  /**
   * Required field
   */
  required?: boolean;
  /**
   * Full width
   */
  fullWidth?: boolean;
  /**
   * Placeholder text
   */
  placeholder?: string;
}

/**
 * FormSelect component that integrates with react-hook-form
 * 
 * @example
 * ```tsx
 * <FormSelect
 *   name="category"
 *   control={control}
 *   label="دسته‌بندی"
 *   options={[
 *     { value: '1', label: 'ریاضی' },
 *     { value: '2', label: 'فیزیک' },
 *   ]}
 *   required
 * />
 * ```
 */
export function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  options,
  helperText,
  error,
  required = false,
  fullWidth = true,
  placeholder,
  ...props
}: FormSelectProps<T>) {
  const labelId = useId();
  const selectId = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const filled = hasSelectValue(field.value);
        const showPlaceholder = !!placeholder && !filled;

        return (
          <StyledFormControl
            fullWidth={fullWidth}
            error={error || !!fieldState.error}
            required={required}
            variant="outlined"
          >
            <InputLabel id={labelId} htmlFor={selectId} shrink={filled || showPlaceholder}>
              {label}
            </InputLabel>
            <Select
              {...field}
              {...props}
              id={selectId}
              labelId={labelId}
              label={label}
              value={filled ? field.value : ''}
              displayEmpty={showPlaceholder}
              onChange={(event) => {
                const raw = event.target.value;
                if (raw === '') {
                  field.onChange(null);
                  return;
                }
                const matched = options.find((opt) => valuesMatch(opt.value, raw));
                field.onChange(matched?.value ?? raw);
              }}
              renderValue={(value) => {
                if (!hasSelectValue(value) && placeholder) {
                  return <em style={{ color: 'rgba(0, 0, 0, 0.6)' }}>{placeholder}</em>;
                }
                const option = options.find((opt) => valuesMatch(opt.value, value));
                return option?.label ?? String(value);
              }}
            >
              {showPlaceholder && (
                <MenuItem value="" disabled>
                  <em>{placeholder}</em>
                </MenuItem>
              )}
              {options.map((option) => (
                <MenuItem
                  key={String(option.value)}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(helperText || fieldState.error) && (
              <FormHelperText>{helperText || fieldState.error?.message}</FormHelperText>
            )}
          </StyledFormControl>
        );
      }}
    />
  );
}

