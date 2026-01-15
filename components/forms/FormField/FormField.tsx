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

export interface FormFieldProps<T extends FieldValues> extends Omit<TextFieldProps, 'name' | 'control'> {
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
}

/**
 * FormField component that integrates with react-hook-form
 * 
 * @example
 * ```tsx
 * <FormField
 *   name="email"
 *   control={control}
 *   label="ایمیل"
 *   type="email"
 *   required
 * />
 * ```
 */
export function FormField<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  error,
  required = false,
  fullWidth = true,
  ...props
}: FormFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <StyledTextField
          {...field}
          {...props}
          label={label}
          error={error || !!fieldState.error}
          helperText={helperText || fieldState.error?.message}
          required={required}
          fullWidth={fullWidth}
        />
      )}
    />
  );
}

