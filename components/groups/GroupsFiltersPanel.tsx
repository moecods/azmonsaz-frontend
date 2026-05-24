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
import type { GroupsListFilters, GroupSizeFilter, GroupSort } from "@/lib/groups-list-utils";

interface GroupsFiltersPanelProps {
  filters: GroupsListFilters;
  onChange: (patch: Partial<GroupsListFilters>) => void;
  creators: Array<{ id: number; name: string }>;
  showCreatorFilter: boolean;
  resultCount: number;
  totalCount: number;
}

const SIZE_LABELS: Record<GroupSizeFilter, string> = {
  all: "همه اندازه‌ها",
  empty: "بدون عضو",
  small: "۱–۱۰ نفر",
  medium: "۱۱–۵۰ نفر",
  large: "بیش از ۵۰ نفر",
};

const SORT_LABELS: Record<GroupSort, string> = {
  newest: "جدیدترین",
  oldest: "قدیمی‌ترین",
  name: "نام (الفبا)",
  members_desc: "بیشترین عضو",
  members_asc: "کمترین عضو",
};

export function GroupsFiltersPanel({
  filters,
  onChange,
  creators,
  showCreatorFilter,
  resultCount,
  totalCount,
}: GroupsFiltersPanelProps) {
  const hasActive =
    !!filters.search ||
    filters.size !== "all" ||
    filters.sort !== "newest" ||
    filters.creatorId !== "";

  const clearAll = () =>
    onChange({
      search: "",
      size: "all",
      sort: "newest",
      creatorId: "",
    });

  return (
    <QuestionBankFiltersPanel title="فیلتر گروه‌ها">
      <TextField
        fullWidth
        size="small"
        placeholder="جستجو در نام، توضیح، سازنده، اعضا…"
        value={filters.search}
        onChange={(e) => onChange({ search: e.target.value })}
        InputProps={{
          startAdornment: <SearchIcon sx={{ me: 1, color: "text.secondary", fontSize: 20 }} />,
        }}
      />

      <FormControl size="small" fullWidth>
        <InputLabel>تعداد اعضا</InputLabel>
        <Select
          value={filters.size}
          label="تعداد اعضا"
          onChange={(e) => onChange({ size: e.target.value as GroupSizeFilter })}
        >
          {(Object.keys(SIZE_LABELS) as GroupSizeFilter[]).map((key) => (
            <MenuItem key={key} value={key}>
              {SIZE_LABELS[key]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel>مرتب‌سازی</InputLabel>
        <Select
          value={filters.sort}
          label="مرتب‌سازی"
          onChange={(e) => onChange({ sort: e.target.value as GroupSort })}
        >
          {(Object.keys(SORT_LABELS) as GroupSort[]).map((key) => (
            <MenuItem key={key} value={key}>
              {SORT_LABELS[key]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {showCreatorFilter && creators.length > 0 && (
        <FormControl size="small" fullWidth>
          <InputLabel>ایجادکننده</InputLabel>
          <Select
            value={filters.creatorId}
            label="ایجادکننده"
            onChange={(e) => {
              const v = e.target.value;
              onChange({ creatorId: v === "" ? "" : Number(v) });
            }}
          >
            <MenuItem value="">همه</MenuItem>
            {creators.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Chip
          size="small"
          variant="outlined"
          label={`${resultCount.toLocaleString("fa-IR")} از ${totalCount.toLocaleString("fa-IR")} گروه`}
        />
      </Stack>

      {hasActive && (
        <Chip size="small" label="پاک کردن فیلترها" variant="outlined" onClick={clearAll} />
      )}
    </QuestionBankFiltersPanel>
  );
}
