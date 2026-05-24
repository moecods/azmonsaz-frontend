"use client";

import { Chip, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { QuestionBankFiltersPanel } from "@/components/questions/question-bank";
import type { MyExamsFilter, MyExamsListFilters } from "@/lib/my-exams-utils";

interface MyExamsFiltersPanelProps {
  filters: MyExamsListFilters;
  onChange: (patch: Partial<MyExamsListFilters>) => void;
  resultCount: number;
  totalCount: number;
  stats: {
    needsAction: number;
    upcoming: number;
    completed: number;
    awaiting: number;
  };
}

const FILTER_LABELS: Record<MyExamsFilter, string> = {
  all: "همه",
  action: "نیاز به اقدام",
  upcoming: "پیشِ رو",
  completed: "تکمیل‌شده",
  awaiting: "در انتظار نتیجه",
  closed: "پایان‌یافته / غیبت",
};

export function MyExamsFiltersPanel({
  filters,
  onChange,
  resultCount,
  totalCount,
  stats,
}: MyExamsFiltersPanelProps) {
  const hasActive = !!filters.search || filters.status !== "all";

  const clearAll = () => onChange({ search: "", status: "all" });

  return (
    <QuestionBankFiltersPanel title="فیلتر آزمون‌ها">
      <TextField
        fullWidth
        size="small"
        placeholder="جستجو در عنوان یا نام معلم…"
        value={filters.search}
        onChange={(e) => onChange({ search: e.target.value })}
        InputProps={{
          startAdornment: <SearchIcon sx={{ me: 1, color: "text.secondary", fontSize: 20 }} />,
        }}
      />

      <FormControl size="small" fullWidth>
        <InputLabel>دسته‌بندی</InputLabel>
        <Select
          value={filters.status}
          label="دسته‌بندی"
          onChange={(e) => onChange({ status: e.target.value as MyExamsFilter })}
        >
          {(Object.keys(FILTER_LABELS) as MyExamsFilter[]).map((key) => {
            let hint = "";
            if (key === "action" && stats.needsAction > 0) hint = ` (${stats.needsAction})`;
            if (key === "upcoming" && stats.upcoming > 0) hint = ` (${stats.upcoming})`;
            if (key === "completed" && stats.completed > 0) hint = ` (${stats.completed})`;
            if (key === "awaiting" && stats.awaiting > 0) hint = ` (${stats.awaiting})`;
            return (
              <MenuItem key={key} value={key}>
                {FILTER_LABELS[key]}
                {hint}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>

      <Stack direction="row" flexWrap="wrap" gap={0.5}>
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
