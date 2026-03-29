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
  Box,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ExamFilters as Filters } from '@/hooks/useQuestionManagement';
import { useQuestionCategories } from '@/hooks';
import { useDebounce } from '@/hooks';
import { useState, useMemo } from 'react';
import {FilterContainer} from "@/components/ui/Layout/FilterContainer";

interface ExamFiltersProps {
  filters: Filters;
  categories: Array<{ id: number; name: string }>;
  allTags: string[];
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
}

export const ExamFilters = React.memo(function QuestionFilters({
  filters,
  categories,
}: ExamFiltersProps) {
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
    <FilterContainer open={showFilters}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
        <TextField
          fullWidth
          placeholder="جستجو در عنوان آزمون..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <FormControl fullWidth>
          <InputLabel>وضعیت</InputLabel>
          <Select
            value={statusFilter}
            label="وضعیت"
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | 'draft' | 'published');
              setPage(1);
            }}
          >
            <MenuItem value="all">همه</MenuItem>
            <MenuItem value="draft">پیش‌نویس</MenuItem>
            <MenuItem value="published">منتشر شده</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>نوع</InputLabel>
          <Select
            value={typeFilter}
            label="نوع"
            onChange={(e) => {
              setTypeFilter(e.target.value as 'all' | 'online' | 'offline');
              setPage(1);
            }}
          >
            <MenuItem value="all">همه</MenuItem>
            <MenuItem value="offline">آفلاین</MenuItem>
            <MenuItem value="online">آنلاین</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </FilterContainer>
  );
});
