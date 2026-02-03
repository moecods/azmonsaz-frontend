"use client";

import React from 'react';
import {
  Card,
  CardContent,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  CircularProgress,
  Box,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { QuestionFilters as Filters } from '@/hooks/useQuestionManagement';
import { QuestionType, Difficulty } from '@/types';
import { useQuestionCategories } from '@/hooks';
import { useDebounce } from '@/hooks';
import { useState, useMemo } from 'react';

interface QuestionFiltersProps {
  filters: Filters;
  categories: Array<{ id: number; name: string }>;
  allTags: string[];
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
}

export const QuestionFilters = React.memo(function QuestionFilters({
  filters,
  categories,
  allTags,
  onFilterChange,
}: QuestionFiltersProps) {
  const [categorySearch, setCategorySearch] = useState('');
  const debouncedCategorySearch = useDebounce(categorySearch, 300);

  // Fetch categories (will be filtered client-side)
  const { data: allCategoriesData, isLoading: categoriesLoading } = useQuestionCategories();
  const allCategories = allCategoriesData || [];

  // Filter categories based on search (show max 50 if no search)
  const filteredCategories = useMemo(() => {
    if (!debouncedCategorySearch) {
      return allCategories.slice(0, 50);
    }
    return allCategories.filter((category) =>
      category.name.toLowerCase().includes(debouncedCategorySearch.toLowerCase())
    );
  }, [allCategories, debouncedCategorySearch]);

  // Use filtered categories or fallback to provided categories
  const displayCategories = filteredCategories.length > 0 ? filteredCategories : categories;

  const selectedCategory = displayCategories.find((c) => c.id === filters.category) || null;

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="جستجوی سوالات"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <Stack direction="row" spacing={2}>
            <Autocomplete
              fullWidth
              options={displayCategories}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={selectedCategory}
              onChange={(_, newValue) => {
                onFilterChange('category', newValue ? newValue.id : '');
              }}
              onInputChange={(_, newInputValue) => {
                setCategorySearch(newInputValue);
              }}
              loading={categoriesLoading}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id}>
                  {option.name}
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="دسته‌بندی"
                  placeholder="جستجوی دسته‌بندی..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {categoriesLoading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              noOptionsText={
                debouncedCategorySearch
                  ? `هیچ دسته‌بندی‌ای با "${debouncedCategorySearch}" یافت نشد`
                  : 'دسته‌بندی‌ای وجود ندارد'
              }
              loadingText="در حال بارگذاری..."
            />
            <FormControl fullWidth>
              <InputLabel>سطح دشواری</InputLabel>
              <Select
                value={filters.difficulty}
                onChange={(e) => onFilterChange('difficulty', e.target.value as Difficulty | '')}
                label="سطح دشواری"
              >
                <MenuItem value="">همه سطوح</MenuItem>
                <MenuItem value="easy">آسان</MenuItem>
                <MenuItem value="medium">متوسط</MenuItem>
                <MenuItem value="hard">سخت</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>نوع سوال</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => onFilterChange('type', e.target.value as QuestionType | '')}
                label="نوع سوال"
              >
                <MenuItem value="">همه انواع</MenuItem>
                <MenuItem value="multiple_choice">چند گزینه‌ای</MenuItem>
                <MenuItem value="true_false">صحیح/غلط</MenuItem>
                <MenuItem value="multiple_select">چند گزینه‌ای (چند پاسخ)</MenuItem>
                <MenuItem value="essay">تشریحی</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>مرتب‌سازی</InputLabel>
              <Select
                value={filters.sort}
                onChange={(e) => onFilterChange('sort', e.target.value as 'newest' | 'oldest')}
                label="مرتب‌سازی"
              >
                <MenuItem value="newest">جدیدترین</MenuItem>
                <MenuItem value="oldest">قدیمی‌ترین</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* Tags Filter */}
          <Autocomplete
            multiple
            options={allTags}
            value={filters.tags}
            onChange={(_, newValue) => onFilterChange('tags', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  {...getTagProps({ index })}
                  key={index}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="برچسب‌ها"
                placeholder="برچسب‌ها را برای فیلتر انتخاب کنید"
              />
            )}
            sx={{ width: '100%' }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
});

