"use client";

import { useMemo, useState } from "react";
import NextLink from "next/link";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SearchIcon from "@mui/icons-material/Search";
import {
  GroupPickCard,
  type GroupPickItem,
} from "@/components/exams/participants/GroupPickCard";

interface ParticipantGroupsTabProps {
  availableGroups: GroupPickItem[];
  examGroupIds: Set<number>;
  selectedGroupIds: number[];
  onToggleGroup: (groupId: number) => void;
  onAddGroups: () => void;
  onRemoveGroup: (groupId: number) => void;
  onCreateGroup: () => void;
  isAdding: boolean;
  isRemoving: boolean;
  /** Narrow sidebar on large screens — single-column cards */
  compact?: boolean;
}

function filterGroups(groups: GroupPickItem[], query: string): GroupPickItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups.filter(
    (g) =>
      g.name.toLowerCase().includes(q) ||
      (g.description?.toLowerCase().includes(q) ?? false)
  );
}

export function ParticipantGroupsTab({
  availableGroups,
  examGroupIds,
  selectedGroupIds,
  onToggleGroup,
  onAddGroups,
  onRemoveGroup,
  onCreateGroup,
  isAdding,
  isRemoving,
  compact = false,
}: ParticipantGroupsTabProps) {
  const theme = useTheme();
  const [search, setSearch] = useState("");

  const attachedGroups = useMemo(
    () => availableGroups.filter((g) => examGroupIds.has(g.id)),
    [availableGroups, examGroupIds]
  );

  const addableGroups = useMemo(
    () => availableGroups.filter((g) => !examGroupIds.has(g.id)),
    [availableGroups, examGroupIds]
  );

  const filteredAddable = useMemo(
    () => filterGroups(addableGroups, search),
    [addableGroups, search]
  );

  const gridColumns = compact
    ? "1fr"
    : { xs: "1fr", sm: "repeat(2, 1fr)" };

  if (availableGroups.length === 0) {
    return (
      <Stack spacing={2} alignItems="flex-start">
        <Alert severity="info" sx={{ width: "100%" }}>
          هنوز گروهی تعریف نشده. یک گروه بسازید و اعضا را به آن اضافه کنید.
        </Alert>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateGroup}>
            ایجاد گروه جدید
          </Button>
          <Button
            component={NextLink}
            href="/groups"
            variant="outlined"
            endIcon={<OpenInNewIcon />}
          >
            مدیریت گروه‌ها
          </Button>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
      >
        <Typography variant="body2" color="text.secondary">
          با انتخاب گروه، همهٔ اعضای آن به‌صورت یکجا به آزمون اضافه می‌شوند.
        </Typography>
        <Stack direction="row" spacing={1} flexShrink={0}>
          <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={onCreateGroup}>
            گروه جدید
          </Button>
          <Button
            component={NextLink}
            href="/groups"
            size="small"
            variant="text"
            endIcon={<OpenInNewIcon fontSize="small" />}
          >
            همه گروه‌ها
          </Button>
        </Stack>
      </Stack>

      {attachedGroups.length > 0 && (
        <Box>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
            گروه‌های این آزمون ({attachedGroups.length.toLocaleString("fa-IR")})
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: gridColumns,
              gap: 1.5,
            }}
          >
            {attachedGroups.map((group) => (
              <GroupPickCard
                key={group.id}
                group={group}
                variant="attached"
                compact={compact}
                disabled={isRemoving}
                onRemove={() => onRemoveGroup(group.id)}
              />
            ))}
          </Box>
        </Box>
      )}

      {addableGroups.length > 0 && (
        <Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ sm: "center" }}
            justifyContent="space-between"
            sx={{ mb: 1.5 }}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              افزودن گروه ({addableGroups.length.toLocaleString("fa-IR")})
            </Typography>
            <TextField
              size="small"
              placeholder="جستجوی گروه..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: { xs: "100%", sm: 220 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          {filteredAddable.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
              گروهی با این عبارت پیدا نشد.
            </Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: gridColumns,
                gap: 1.5,
                maxHeight: compact ? 360 : 420,
                overflowY: "auto",
                pr: 0.5,
              }}
            >
              {filteredAddable.map((group) => (
                <GroupPickCard
                  key={group.id}
                  group={group}
                  variant="select"
                  compact={compact}
                  selected={selectedGroupIds.includes(group.id)}
                  onSelect={() => onToggleGroup(group.id)}
                />
              ))}
            </Box>
          )}
        </Box>
      )}

      {addableGroups.length === 0 && attachedGroups.length > 0 && (
        <Alert severity="success" sx={{ py: 0.5 }}>
          همهٔ گروه‌های موجود به این آزمون متصل شده‌اند.
        </Alert>
      )}

      {selectedGroupIds.length > 0 && (
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            pt: 1,
            pb: 0.5,
            bgcolor: alpha(theme.palette.background.paper, 0.92),
            backdropFilter: "blur(6px)",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Button
            variant="contained"
            fullWidth
            onClick={onAddGroups}
            disabled={isAdding}
            startIcon={isAdding ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
          >
            {isAdding
              ? "در حال افزودن..."
              : `افزودن ${selectedGroupIds.length.toLocaleString("fa-IR")} گروه به آزمون`}
          </Button>
        </Box>
      )}
    </Stack>
  );
}
