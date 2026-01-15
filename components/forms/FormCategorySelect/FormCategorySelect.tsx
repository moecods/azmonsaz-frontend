"use client";

import React, { useState } from 'react';
import { Autocomplete, TextField, CircularProgress, Box } from '@mui/material';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { useQuestionCategories } from '@/hooks';
import { useDebounce } from '@/hooks';
import { QuestionCategory } from '@/types';

export interface FormCategorySelectProps<T extends FieldValues> {
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
  label?: string;
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
   * Disabled state
   */
  disabled?: boolean;
}

/**
 * Category Select component with search capability
 * Uses Autocomplete for better UX with large category lists
 * 
 * @example
 * ```tsx
 * <FormCategorySelect
 *   name="category_id"
 *   control={control}
 *   label="دسته‌بندی"
 *   required
 * />
 * ```
 */
export function FormCategorySelect<T extends FieldValues>({
  name,
  control,
  label = 'دسته‌بندی',
  helperText,
  error,
  required = false,
  fullWidth = true,
  disabled = false,
}: FormCategorySelectProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch categories
  const { data: categoriesData, isLoading } = useQuestionCategories();
  const categories = categoriesData || [];

  // Filter categories based on search
  const filteredCategories = React.useMemo(() => {
    if (!debouncedSearch) {
      // Show first 50 categories if no search
      return categories.slice(0, 50);
    }
    // Filter by search term
    return categories.filter((category) =>
      category.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [categories, debouncedSearch]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Autocomplete<QuestionCategory>
          options={filteredCategories}
          getOptionLabel={(option) => option.name || ''}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={
            field.value
              ? categories.find((c) => c.id === field.value) || null
              : null
          }
          onChange={(_, newValue) => {
            field.onChange(newValue ? newValue.id : null);
          }}
          onInputChange={(_, newInputValue) => {
            setSearchTerm(newInputValue);
          }}
          loading={isLoading}
          disabled={disabled}
          fullWidth={fullWidth}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.id}>
              {option.name}
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              error={error || !!fieldState.error}
              helperText={helperText || fieldState.error?.message}
              required={required}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              placeholder="جستجوی دسته‌بندی..."
            />
          )}
          noOptionsText={
            debouncedSearch
              ? `هیچ دسته‌بندی‌ای با "${debouncedSearch}" یافت نشد`
              : 'دسته‌بندی‌ای وجود ندارد'
          }
          loadingText="در حال بارگذاری..."
        />
      )}
    />
  );
}

