"use client";

import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
  },
}));

export interface FormNumberFieldProps<T extends FieldValues> extends Omit<TextFieldProps, 'name' | 'control' | 'type' | 'value' | 'onChange'> {
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
   * Minimum value
   */
  min?: number;
  /**
   * Maximum value
   */
  max?: number;
}

/**
 * FormNumberField component for number inputs with react-hook-form
 * 
 * @example
 * ```tsx
 * <FormNumberField
 *   name="age"
 *   control={control}
 *   label="سن"
 *   min={0}
 *   max={120}
 *   required
 * />
 * ```
 */
export function FormNumberField<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  error,
  required = false,
  fullWidth = true,
  min,
  max,
  ...props
}: FormNumberFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <StyledTextField
          {...props}
          {...field}
          type="number"
          label={label}
          error={error || !!fieldState.error}
          helperText={helperText || fieldState.error?.message}
          required={required}
          fullWidth={fullWidth}
          value={field.value ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            field.onChange(value ? parseInt(value, 10) : null);
          }}
          inputProps={{ min, max }}
        />
      )}
    />
  );
}

