"use client";

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { Difficulty, QuestionCategory } from "@/types";

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
}

export function QuestionBankFilters({
  filters,
  onChange,
  categories,
  loadedCount,
  totalCount,
}: QuestionBankFiltersProps) {
  return (
    <Stack spacing={1.5}>
      <TextField
        fullWidth
        size="small"
        label="جستجوی سوالات"
        value={filters.searchTerm}
        onChange={(e) => onChange({ searchTerm: e.target.value })}
        InputProps={{
          startAdornment: (
            <SearchIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />
          ),
        }}
      />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
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
            <MenuItem value="">همه</MenuItem>
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
            <MenuItem value="">همه</MenuItem>
            <MenuItem value="easy">آسان</MenuItem>
            <MenuItem value="medium">متوسط</MenuItem>
            <MenuItem value="hard">سخت</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      {totalCount !== undefined && totalCount > 0 && (
        <Typography variant="caption" color="text.secondary">
          {(loadedCount ?? 0).toLocaleString("fa-IR")} از{" "}
          {totalCount.toLocaleString("fa-IR")} سوال
        </Typography>
      )}
    </Stack>
  );
}
