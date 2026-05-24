"use client";

import React, { useMemo, useState } from "react";
import {
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { QuestionFilters as Filters } from "@/hooks/useQuestionManagement";
import { getSupportedQuestionTypeIds, getQuestionTypeLabel } from "@/lib/question-types";
import { QuestionType, Difficulty } from "@/types";
import { useQuestionCategories } from "@/hooks";
import { useDebounce } from "@/hooks";
import { QuestionBankFiltersPanel } from "@/components/questions/question-bank";

interface QuestionFiltersProps {
  filters: Filters;
  categories: Array<{ id: number; name: string }>;
  allTags: string[];
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  loadedCount?: number;
  totalCount?: number;
  isRefetching?: boolean;
}

export const QuestionFilters = React.memo(function QuestionFilters({
  filters,
  categories,
  allTags,
  onFilterChange,
  loadedCount,
  totalCount,
  isRefetching,
}: QuestionFiltersProps) {
  const [categorySearch, setCategorySearch] = useState("");
  const debouncedCategorySearch = useDebounce(categorySearch, 300);

  const { data: allCategoriesData, isLoading: categoriesLoading } = useQuestionCategories();
  const allCategories = allCategoriesData || [];

  const filteredCategories = useMemo(() => {
    if (!debouncedCategorySearch) {
      return allCategories.slice(0, 50);
    }
    return allCategories.filter((category) =>
      category.name.toLowerCase().includes(debouncedCategorySearch.toLowerCase())
    );
  }, [allCategories, debouncedCategorySearch]);

  const displayCategories = filteredCategories.length > 0 ? filteredCategories : categories;
  const selectedCategory = displayCategories.find((c) => c.id === filters.category) || null;

  const hasActiveFilters =
    !!filters.search ||
    filters.category !== "" ||
    filters.difficulty !== "" ||
    filters.type !== "" ||
    filters.tags.length > 0;

  const clearAll = () => {
    onFilterChange("search", "");
    onFilterChange("category", "");
    onFilterChange("difficulty", "");
    onFilterChange("type", "");
    onFilterChange("tags", []);
  };

  return (
    <QuestionBankFiltersPanel
      loadedCount={loadedCount}
      totalCount={totalCount}
      isRefetching={isRefetching}
    >
      <TextField
        fullWidth
        size="small"
        placeholder="جستجو در متن سوال، برچسب…"
        value={filters.search}
        onChange={(e) => onFilterChange("search", e.target.value)}
        InputProps={{
          startAdornment: <SearchIcon sx={{ me: 1, color: "text.secondary", fontSize: 20 }} />,
        }}
      />

      <Autocomplete
        size="small"
        options={displayCategories}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={selectedCategory}
        onChange={(_, newValue) => {
          onFilterChange("category", newValue ? newValue.id : "");
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
            placeholder="جستجوی دسته…"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {categoriesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        noOptionsText={
          debouncedCategorySearch
            ? `هیچ دسته‌ای با «${debouncedCategorySearch}» یافت نشد`
            : "دسته‌بندی‌ای وجود ندارد"
        }
        loadingText="در حال بارگذاری…"
      />

      <FormControl size="small" fullWidth>
        <InputLabel>سطح سختی</InputLabel>
        <Select
          value={filters.difficulty}
          onChange={(e) => onFilterChange("difficulty", e.target.value as Difficulty | "")}
          label="سطح سختی"
        >
          <MenuItem value="">همه سطوح</MenuItem>
          <MenuItem value="easy">آسان</MenuItem>
          <MenuItem value="medium">متوسط</MenuItem>
          <MenuItem value="hard">سخت</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel>نوع سوال</InputLabel>
        <Select
          value={filters.type}
          onChange={(e) => onFilterChange("type", e.target.value as QuestionType | "")}
          label="نوع سوال"
        >
          <MenuItem value="">همه انواع</MenuItem>
          {getSupportedQuestionTypeIds().map((id) => (
            <MenuItem key={id} value={id}>
              {getQuestionTypeLabel(id)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel>مرتب‌سازی</InputLabel>
        <Select
          value={filters.sort}
          onChange={(e) => onFilterChange("sort", e.target.value as "newest" | "oldest")}
          label="مرتب‌سازی"
        >
          <MenuItem value="newest">جدیدترین</MenuItem>
          <MenuItem value="oldest">قدیمی‌ترین</MenuItem>
        </Select>
      </FormControl>

      <Autocomplete
        multiple
        size="small"
        options={allTags}
        value={filters.tags}
        onChange={(_, newValue) => onFilterChange("tags", newValue)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option}
              {...getTagProps({ index })}
              key={option}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))
        }
        renderInput={(params) => (
          <TextField {...params} label="برچسب‌ها" placeholder="انتخاب برچسب" />
        )}
      />

      {hasActiveFilters && (
        <Stack direction="row" flexWrap="wrap" gap={0.5} useFlexGap>
          <Chip size="small" label="پاک کردن فیلترها" variant="outlined" onClick={clearAll} />
        </Stack>
      )}
    </QuestionBankFiltersPanel>
  );
});
