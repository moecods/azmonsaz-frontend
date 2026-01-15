"use client";

import React from 'react';
import { FormControl, InputLabel, Select, SelectProps, MenuItem, FormHelperText } from '@mui/material';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { styled } from '@mui/material/styles';

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
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <StyledFormControl
          fullWidth={fullWidth}
          error={error || !!fieldState.error}
          required={required}
        >
          <InputLabel>{label}</InputLabel>
          <Select
            {...field}
            {...props}
            label={label}
            displayEmpty={!!placeholder}
            renderValue={(value) => {
              if (!value && placeholder) {
                return <em style={{ color: 'rgba(0, 0, 0, 0.6)' }}>{placeholder}</em>;
              }
              const option = options.find((opt) => opt.value === value);
              return option?.label || value;
            }}
          >
            {placeholder && (
              <MenuItem value="" disabled>
                <em>{placeholder}</em>
              </MenuItem>
            )}
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {(helperText || fieldState.error) && (
            <FormHelperText>{helperText || fieldState.error?.message}</FormHelperText>
          )}
        </StyledFormControl>
      )}
    />
  );
}

