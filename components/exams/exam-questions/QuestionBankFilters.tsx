"use client";

import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { Difficulty, QuestionCategory } from "@/types";
import { QuestionBankFiltersPanel } from "@/components/questions/question-bank";

export interface QuestionBankFilterState {
  searchTerm: string;
  selectedCategory: number | "";
  selectedDifficulty: Difficulty | "";
}

interface QuestionBankFiltersProps {
  filters: QuestionBankFilterState;
  onChange: (patch: Partial<QuestionBankFilterState>) => void;
  categories: QuestionCategory[];
  loadedCount?: number;
  totalCount?: number;
  isRefetching?: boolean;
}

export function QuestionBankFilters({
  filters,
  onChange,
  categories,
  loadedCount,
  totalCount,
  isRefetching,
}: QuestionBankFiltersProps) {
  const hasActiveFilters =
    !!filters.searchTerm ||
    filters.selectedCategory !== "" ||
    filters.selectedDifficulty !== "";

  const clearAll = () =>
    onChange({
      searchTerm: "",
      selectedCategory: "",
      selectedDifficulty: "",
    });

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
        value={filters.searchTerm}
        onChange={(e) => onChange({ searchTerm: e.target.value })}
        InputProps={{
          startAdornment: (
            <SearchIcon sx={{ me: 1, color: "text.secondary", fontSize: 20 }} />
          ),
        }}
      />

      <FormControl size="small" fullWidth>
        <InputLabel>دسته‌بندی</InputLabel>
        <Select
          value={filters.selectedCategory}
          onChange={(e) => {
            const value = e.target.value;
            onChange({
              selectedCategory: value === "" ? "" : Number(value),
            });
          }}
          label="دسته‌بندی"
        >
          <MenuItem value="">همه دسته‌ها</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel>سطح سختی</InputLabel>
        <Select
          value={filters.selectedDifficulty}
          onChange={(e) =>
            onChange({ selectedDifficulty: e.target.value as Difficulty | "" })
          }
          label="سطح سختی"
        >
          <MenuItem value="">همه سطوح</MenuItem>
          <MenuItem value="easy">آسان</MenuItem>
          <MenuItem value="medium">متوسط</MenuItem>
          <MenuItem value="hard">سخت</MenuItem>
        </Select>
      </FormControl>

      {hasActiveFilters && (
        <Stack direction="row" flexWrap="wrap" gap={0.5} useFlexGap alignItems="center">
          {filters.searchTerm && (
            <Chip
              size="small"
              label={`جستجو: ${filters.searchTerm}`}
              onDelete={() => onChange({ searchTerm: "" })}
            />
          )}
          {filters.selectedCategory !== "" && (
            <Chip
              size="small"
              label={
                categories.find((c) => c.id === filters.selectedCategory)?.name ??
                "دسته"
              }
              onDelete={() => onChange({ selectedCategory: "" })}
            />
          )}
          {filters.selectedDifficulty !== "" && (
            <Chip
              size="small"
              label={`سختی: ${filters.selectedDifficulty}`}
              onDelete={() => onChange({ selectedDifficulty: "" })}
            />
          )}
          <Chip size="small" label="پاک کردن همه" variant="outlined" onClick={clearAll} />
        </Stack>
      )}
    </QuestionBankFiltersPanel>
  );
}
