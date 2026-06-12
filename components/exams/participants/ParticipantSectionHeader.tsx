"use client";

import type { ReactNode } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import type { ParticipantListStats } from "@/lib/participant-list-stats";
import type { ParticipantStatusFilter } from "@/lib/participant-list-stats";
import type { GroupPickItem } from "@/components/exams/participants/GroupPickCard";
import { ParticipantAttachedGroupsStrip } from "@/components/exams/participants/ParticipantAttachedGroupsStrip";
import { participantGridColumns } from "@/components/exams/participants/participant-grid-columns";

const STATUS_FILTERS: { value: ParticipantStatusFilter; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "registered", label: "ثبت‌نام" },
  { value: "in_progress", label: "در حال انجام" },
  { value: "completed", label: "پایان‌یافته" },
  { value: "absent", label: "غیبت" },
];

interface ParticipantSectionHeaderProps {
  stats: ParticipantListStats;
  filteredCount: number;
  totalCount: number;
  statusFilter: ParticipantStatusFilter;
  onStatusFilterChange: (v: ParticipantStatusFilter) => void;
  search: string;
  onSearchChange: (v: string) => void;
  viewMode: "all" | "grouped";
  onViewModeChange: (v: "all" | "grouped") => void;
  showViewToggle: boolean;
  attachedGroups: GroupPickItem[];
  onAddClick: () => void;
  onExportCsv?: () => void;
}

export function ParticipantSectionHeader({
  stats,
  filteredCount,
  totalCount,
  statusFilter,
  onStatusFilterChange,
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  showViewToggle,
  attachedGroups,
  onAddClick,
  onExportCsv,
}: ParticipantSectionHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const countLabel =
    filteredCount !== totalCount
      ? `${filteredCount.toLocaleString("fa-IR")}/${totalCount.toLocaleString("fa-IR")}`
      : totalCount.toLocaleString("fa-IR");

  const desktopSummary = [
    `${totalCount.toLocaleString("fa-IR")} نفر`,
    stats.inProgress > 0 ? `${stats.inProgress.toLocaleString("fa-IR")} در حال انجام` : null,
    stats.completed > 0 ? `${stats.completed.toLocaleString("fa-IR")} پایان‌یافته` : null,
    stats.passed > 0 ? `${stats.passed.toLocaleString("fa-IR")} قبول` : null,
  ].filter(Boolean);

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: { xs: 2, sm: 2.5 },
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        sx={{
          px: { xs: 1.25, sm: 2 },
          py: { xs: 1, sm: 1.75 },
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: alpha(theme.palette.primary.main, 0.03),
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="baseline" spacing={0.75} flexWrap="wrap" useFlexGap>
            <Typography variant={isMobile ? "body1" : "subtitle1"} fontWeight={800} lineHeight={1.3}>
              شرکت‌کنندگان
            </Typography>
            {isMobile && (
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {countLabel} نفر
              </Typography>
            )}
          </Stack>
          {!isMobile && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {filteredCount !== totalCount
                ? `${filteredCount.toLocaleString("fa-IR")} از ${totalCount.toLocaleString("fa-IR")} نفر نمایش داده می‌شود`
                : desktopSummary.join(" · ")}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
          {onExportCsv && totalCount > 0 &&
            (isMobile ? (
              <Tooltip title="خروجی CSV">
                <IconButton
                  size="small"
                  onClick={onExportCsv}
                  aria-label="خروجی CSV"
                  sx={{ border: 1, borderColor: "divider" }}
                >
                  <FileDownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Button variant="outlined" size="small" startIcon={<FileDownloadIcon />} onClick={onExportCsv}>
                CSV
              </Button>
            ))}
          {isMobile ? (
            <Tooltip title="افزودن شرکت‌کننده">
              <IconButton
                size="small"
                onClick={onAddClick}
                data-cy="participants-add-open"
                aria-label="افزودن"
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                <PersonAddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={onAddClick}
              data-cy="participants-add-open"
              sx={{ fontWeight: 700 }}
            >
              افزودن
            </Button>
          )}
        </Stack>
      </Stack>

      <Stack spacing={{ xs: 1, sm: 1.25 }} sx={{ px: { xs: 1.25, sm: 2 }, py: { xs: 1, sm: 1.5 } }}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <TextField
            size="small"
            placeholder={isMobile ? "جستجو..." : "جستجو نام، موبایل، کد ملی یا گروه..."}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          {showViewToggle && (
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              size="small"
              onChange={(_, v) => v && onViewModeChange(v)}
              aria-label="نمایش لیست"
              sx={{ flexShrink: 0 }}
            >
              <ToggleButton value="all" aria-label="لیست" sx={{ px: 1 }}>
                <ViewListIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="grouped" aria-label="گروه‌بندی" sx={{ px: 1 }}>
                <ViewModuleIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Stack>

        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            overflowX: "auto",
            pb: 0.25,
            mx: -0.5,
            px: 0.5,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {STATUS_FILTERS.map((f) => {
            const count =
              f.value === "all"
                ? stats.total
                : f.value === "registered"
                  ? stats.registered
                  : f.value === "in_progress"
                    ? stats.inProgress
                    : f.value === "completed"
                      ? stats.completed
                      : stats.absent;
            const selected = statusFilter === f.value;
            return (
              <Chip
                key={f.value}
                label={
                  isMobile
                    ? `${f.label}${count > 0 ? ` ${count.toLocaleString("fa-IR")}` : ""}`
                    : `${f.label}${count > 0 ? ` (${count.toLocaleString("fa-IR")})` : ""}`
                }
                size="small"
                clickable
                onClick={() => onStatusFilterChange(f.value)}
                aria-pressed={selected}
                sx={{
                  height: 26,
                  flexShrink: 0,
                  fontWeight: selected ? 700 : 500,
                  bgcolor: selected ? alpha(theme.palette.primary.main, 0.12) : "transparent",
                  borderColor: selected ? "primary.main" : "divider",
                }}
                variant={selected ? "filled" : "outlined"}
              />
            );
          })}
        </Box>

        {attachedGroups.length > 0 && !isMobile && (
          <ParticipantAttachedGroupsStrip groups={attachedGroups} />
        )}
      </Stack>
    </Box>
  );
}

/** Column labels for desktop list */
export function ParticipantListColumnHeader({
  showGroup,
  isDescriptiveGrading,
  showActions,
}: {
  showGroup: boolean;
  isDescriptiveGrading: boolean;
  showActions: boolean;
}) {
  return (
    <Box
      sx={{
        display: { xs: "none", lg: "grid" },
        gridTemplateColumns: participantGridColumns({ showGroup, isDescriptiveGrading, showActions }),
        gap: 1.5,
        px: 2,
        py: 1,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: (t) => (t.palette.mode === "dark" ? "action.hover" : alpha(t.palette.primary.main, 0.04)),
      }}
    >
      <HeaderCell>دانش‌آموز</HeaderCell>
      {showGroup && <HeaderCell>گروه</HeaderCell>}
      <HeaderCell align="center">{isDescriptiveGrading ? "نمره" : "بارم"}</HeaderCell>
      {isDescriptiveGrading && <HeaderCell align="center">توصیفی</HeaderCell>}
      <HeaderCell align="center">وضعیت</HeaderCell>
      <HeaderCell>زمان</HeaderCell>
      {showActions && <Box />}
    </Box>
  );
}

function HeaderCell({
  children,
  align,
}: {
  children: ReactNode;
  align?: "center";
}) {
  return (
    <Typography
      variant="caption"
      fontWeight={700}
      color="text.secondary"
      sx={{ textAlign: align ?? "start", letterSpacing: 0.2 }}
    >
      {children}
    </Typography>
  );
}
