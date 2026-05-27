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
import { QuestionBankFiltersPanel } from "@/components/questions/question-bank";
import type {
  ExamsListFilters,
  ExamsSort,
  ExamsStatusFilter,
  ExamsTypeFilter,
} from "@/lib/exams-list-utils";

interface ExamsFiltersPanelProps {
  filters: ExamsListFilters;
  onChange: (patch: Partial<ExamsListFilters>) => void;
  resultCount: number;
  totalCount: number;
}

export const STATUS_LABELS: Record<ExamsStatusFilter, string> = {
  all: "همه وضعیت‌ها",
  published: "منتشرشده",
  draft: "پیش‌نویس",
};

export const TYPE_LABELS: Record<ExamsTypeFilter, string> = {
  all: "همه انواع",
  online: "آنلاین",
  offline: "آفلاین",
};

export const SORT_LABELS: Record<ExamsSort, string> = {
  newest: "جدیدترین",
  oldest: "قدیمی‌ترین",
  title: "عنوان (الفبا)",
  participants_desc: "بیشترین شرکت‌کننده",
};

export function ExamsFiltersPanel({
  filters,
  onChange,
  resultCount,
  totalCount,
}: ExamsFiltersPanelProps) {
  const hasActive =
    !!filters.search ||
    filters.status !== "all" ||
    filters.type !== "all" ||
    filters.sort !== "newest";

  const clearAll = () =>
    onChange({
      search: "",
      status: "all",
      type: "all",
      sort: "newest",
    });

  return (
    <QuestionBankFiltersPanel title="فیلتر آزمون‌ها">
      <TextField
        fullWidth
        size="small"
        placeholder="جستجو در عنوان آزمون…"
        value={filters.search}
        onChange={(e) => onChange({ search: e.target.value })}
        InputProps={{
          startAdornment: <SearchIcon sx={{ me: 1, color: "text.secondary", fontSize: 20 }} />,
        }}
      />

      <FormControl size="small" fullWidth>
        <InputLabel>وضعیت</InputLabel>
        <Select
          value={filters.status}
          label="وضعیت"
          onChange={(e) => onChange({ status: e.target.value as ExamsStatusFilter })}
        >
          {(Object.keys(STATUS_LABELS) as ExamsStatusFilter[]).map((key) => (
            <MenuItem key={key} value={key}>
              {STATUS_LABELS[key]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel>نوع آزمون</InputLabel>
        <Select
          value={filters.type}
          label="نوع آزمون"
          onChange={(e) => onChange({ type: e.target.value as ExamsTypeFilter })}
        >
          {(Object.keys(TYPE_LABELS) as ExamsTypeFilter[]).map((key) => (
            <MenuItem key={key} value={key}>
              {TYPE_LABELS[key]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel>مرتب‌سازی</InputLabel>
        <Select
          value={filters.sort}
          label="مرتب‌سازی"
          onChange={(e) => onChange({ sort: e.target.value as ExamsSort })}
        >
          {(Object.keys(SORT_LABELS) as ExamsSort[]).map((key) => (
            <MenuItem key={key} value={key}>
              {SORT_LABELS[key]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Stack direction="row" flexWrap="wrap" gap={0.5} alignItems="center">
        <Chip
          size="small"
          label={`${resultCount.toLocaleString("fa-IR")} از ${totalCount.toLocaleString("fa-IR")}`}
          color="primary"
          variant="outlined"
        />
        {hasActive && (
          <Chip size="small" label="پاک کردن" onClick={clearAll} onDelete={clearAll} variant="outlined" />
        )}
      </Stack>
    </QuestionBankFiltersPanel>
  );
}
