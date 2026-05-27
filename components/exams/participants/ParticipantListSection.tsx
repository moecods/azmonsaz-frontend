"use client";

import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  IconButton,
  Tooltip,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleIcon from "@mui/icons-material/People";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import { EmptyState } from "@/components/feedback/PageStates";
import UserAvatar from "@/components/ui/UserAvatar";
import { GroupAvatar } from "@/components/groups/GroupAvatar";
import type { UserParticipant } from "@/components/exams/ParticipantManagement.types";
import type { GroupPickItem } from "@/components/exams/participants/GroupPickCard";
import { ParticipantAttachedGroupsStrip } from "@/components/exams/participants/ParticipantAttachedGroupsStrip";
import {
  countParticipantsByStatus,
  filterParticipantsByStatus,
  type ParticipantStatusFilter,
} from "@/lib/participant-list-stats";
import {
  ParticipantNameCell,
  ParticipantStatusChip,
  ScoreCells,
  SectionCard,
} from "@/components/exams/participants/participant-ui-shared";

interface ParticipantListSectionProps {
  participants: UserParticipant[];
  isDescriptiveGrading: boolean;
  groupAvatarById?: Map<number, string | null | undefined>;
  attachedGroups?: GroupPickItem[];
  onAddClick: () => void;
  canManageParticipants?: boolean;
  onRemoveParticipant?: (participant: UserParticipant) => void;
  onExportCsv?: () => void;
}

const STATUS_FILTERS: { value: ParticipantStatusFilter; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "registered", label: "ثبت‌نام" },
  { value: "in_progress", label: "در حال انجام" },
  { value: "completed", label: "پایان‌یافته" },
  { value: "absent", label: "غیبت" },
];

function ParticipantTable({
  rows,
  isDescriptiveGrading,
  showGroupColumn,
  groupAvatarById,
  canManageParticipants,
  onRemoveParticipant,
}: {
  rows: UserParticipant[];
  isDescriptiveGrading: boolean;
  showGroupColumn?: boolean;
  groupAvatarById?: Map<number, string | null | undefined>;
  canManageParticipants?: boolean;
  onRemoveParticipant?: (participant: UserParticipant) => void;
}) {
  const theme = useTheme();

  return (
    <TableContainer>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, bgcolor: (t) => (t.palette.mode === "dark" ? "action.hover" : "grey.50") }}>
              نام
            </TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: (t) => (t.palette.mode === "dark" ? "action.hover" : "grey.50") }}>
              تماس
            </TableCell>
            {showGroupColumn && (
              <TableCell sx={{ fontWeight: 700, bgcolor: (t) => (t.palette.mode === "dark" ? "action.hover" : "grey.50") }}>
                گروه
              </TableCell>
            )}
            {isDescriptiveGrading ? (
              <>
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: (t) => (t.palette.mode === "dark" ? "action.hover" : "grey.50") }}>
                  نمره عددی
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: (t) => (t.palette.mode === "dark" ? "action.hover" : "grey.50") }}>
                  توصیفی
                </TableCell>
              </>
            ) : (
              <TableCell align="center" sx={{ fontWeight: 700, bgcolor: (t) => (t.palette.mode === "dark" ? "action.hover" : "grey.50") }}>
                نمره
              </TableCell>
            )}
            <TableCell align="center" sx={{ fontWeight: 700, bgcolor: (t) => (t.palette.mode === "dark" ? "action.hover" : "grey.50") }}>
              وضعیت
            </TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: (t) => (t.palette.mode === "dark" ? "action.hover" : "grey.50") }}>
              شروع
            </TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: (t) => (t.palette.mode === "dark" ? "action.hover" : "grey.50") }}>
              پایان
            </TableCell>
            {canManageParticipants && (
              <TableCell
                align="center"
                sx={{ fontWeight: 700, bgcolor: (t) => (t.palette.mode === "dark" ? "action.hover" : "grey.50") }}
              />
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((participant, index) => (
            <TableRow
              key={participant.id}
              hover
              sx={{
                bgcolor:
                  index % 2 === 1
                    ? alpha(theme.palette.primary.main, 0.02)
                    : "background.paper",
              }}
            >
              <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                  <UserAvatar
                    name={participant.user?.name ?? "?"}
                    sx={{ width: 32, height: 32, fontSize: "0.8rem" }}
                  />
                  <ParticipantNameCell user={participant.user} />
                </Stack>
              </TableCell>
              <TableCell>{participant.user?.phone_number || "—"}</TableCell>
              {showGroupColumn && (
                <TableCell>
                  {participant.group ? (
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <GroupAvatar
                        name={participant.group.name}
                        avatarUrl={
                          participant.group.avatar_url ??
                          groupAvatarById?.get(participant.group.id)
                        }
                        sx={{ width: 28, height: 28, borderRadius: 1.5, fontSize: "0.75rem" }}
                      />
                      <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: 120 }}>
                        {participant.group.name}
                      </Typography>
                    </Stack>
                  ) : (
                    <Chip label="بدون گروه" size="small" variant="outlined" />
                  )}
                </TableCell>
              )}
              {isDescriptiveGrading ? (
                <>
                  <TableCell align="center">
                    {participant.scaled_score != null
                      ? String(participant.scaled_score)
                      : participant.score !== null && participant.total_points !== null
                        ? `${participant.score} / ${participant.total_points}`
                        : "—"}
                  </TableCell>
                  <TableCell align="center">{participant.outcome_label || "—"}</TableCell>
                </>
              ) : (
                <TableCell align="center">
                  <ScoreCells participant={participant} isDescriptive={false} />
                </TableCell>
              )}
              <TableCell align="center">
                <ParticipantStatusChip participant={participant} />
              </TableCell>
              <TableCell>
                {participant.started_at
                  ? new Date(participant.started_at).toLocaleDateString("fa-IR")
                  : "—"}
              </TableCell>
              <TableCell>
                {participant.completed_at
                  ? new Date(participant.completed_at).toLocaleDateString("fa-IR")
                  : "—"}
              </TableCell>
              {canManageParticipants && onRemoveParticipant && (
                <TableCell align="center">
                  <Tooltip title="حذف از آزمون">
                    <IconButton
                      size="small"
                      color="error"
                      aria-label="حذف شرکت‌کننده"
                      onClick={() => onRemoveParticipant(participant)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ParticipantMobileCard({
  participant,
  isDescriptiveGrading,
  groupAvatarById,
  canManageParticipants,
  onRemoveParticipant,
}: {
  participant: UserParticipant;
  isDescriptiveGrading: boolean;
  groupAvatarById?: Map<number, string | null | undefined>;
  canManageParticipants?: boolean;
  onRemoveParticipant?: (participant: UserParticipant) => void;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <UserAvatar
              name={participant.user?.name ?? "?"}
              sx={{ width: 40, height: 40, fontSize: "0.9rem" }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <ParticipantNameCell user={participant.user} />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                {participant.user?.phone_number || "—"}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <ParticipantStatusChip participant={participant} />
              {canManageParticipants && onRemoveParticipant && (
                <IconButton
                  size="small"
                  color="error"
                  aria-label="حذف"
                  onClick={() => onRemoveParticipant(participant)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          </Stack>

          {participant.group && (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <GroupAvatar
                name={participant.group.name}
                avatarUrl={
                  participant.group.avatar_url ?? groupAvatarById?.get(participant.group.id)
                }
                sx={{ width: 24, height: 24, borderRadius: 1, fontSize: "0.7rem" }}
              />
              <Typography variant="caption" color="text.secondary">
                {participant.group.name}
              </Typography>
            </Stack>
          )}

          <Divider />

          <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Typography variant="caption" color="text.secondary">
              نمره:{" "}
              {isDescriptiveGrading ? (
                <>
                  {participant.scaled_score != null
                    ? String(participant.scaled_score)
                    : "—"}{" "}
                  · {participant.outcome_label || "—"}
                </>
              ) : participant.score !== null && participant.total_points !== null ? (
                `${participant.score} / ${participant.total_points}`
              ) : (
                "—"
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {participant.started_at
                ? `شروع ${new Date(participant.started_at).toLocaleDateString("fa-IR")}`
                : "شروع نشده"}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function ParticipantListSection({
  participants,
  isDescriptiveGrading,
  groupAvatarById,
  attachedGroups = [],
  onAddClick,
  canManageParticipants = false,
  onRemoveParticipant,
  onExportCsv,
}: ParticipantListSectionProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const attachedGroupCount = attachedGroups.length;
  const [viewMode, setViewMode] = useState<"all" | "grouped">(
    attachedGroupCount > 0 ? "grouped" : "all"
  );
  const [statusFilter, setStatusFilter] = useState<ParticipantStatusFilter>("all");
  const [filter, setFilter] = useState("");

  const statusFiltered = useMemo(
    () => filterParticipantsByStatus(participants, statusFilter),
    [participants, statusFilter]
  );

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return statusFiltered;
    return statusFiltered.filter((p) => {
      const name = p.user?.name?.toLowerCase() ?? "";
      const phone = p.user?.phone_number ?? "";
      const group = p.group?.name?.toLowerCase() ?? "";
      return name.includes(q) || phone.includes(q) || group.includes(q);
    });
  }, [statusFiltered, filter]);

  const grouped = useMemo(() => {
    const byGroup = new Map<number, UserParticipant[]>();
    const ungrouped: UserParticipant[] = [];
    for (const p of filtered) {
      if (p.group?.id) {
        const id = p.group.id;
        if (!byGroup.has(id)) byGroup.set(id, []);
        byGroup.get(id)!.push(p);
      } else {
        ungrouped.push(p);
      }
    }
    return { byGroup, ungrouped };
  }, [filtered]);

  const resultLabel =
    filtered.length !== participants.length
      ? `${filtered.length.toLocaleString("fa-IR")} از ${participants.length.toLocaleString("fa-IR")}`
      : participants.length.toLocaleString("fa-IR");

  return (
    <SectionCard
      title="شرکت‌کنندگان"
      icon={<PeopleIcon color="primary" fontSize="small" />}
      subtitle={`${resultLabel} نفر در لیست`}
      action={
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            size="small"
            onChange={(_, v) => v && setViewMode(v)}
            aria-label="نمایش لیست"
          >
            <ToggleButton value="all" aria-label="لیست">
              <ViewListIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton
              value="grouped"
              aria-label="گروه‌بندی"
              disabled={attachedGroupCount === 0}
            >
              <ViewModuleIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
          {onExportCsv && participants.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={onExportCsv}
            >
              CSV
            </Button>
          )}
          <Button
            variant="contained"
            size="small"
            startIcon={<PersonAddIcon />}
            onClick={onAddClick}
            data-cy="participants-add-open"
          >
            افزودن
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <ParticipantAttachedGroupsStrip groups={attachedGroups} />

        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.5}
          alignItems={{ lg: "center" }}
        >
          <TextField
            size="small"
            placeholder="جستجو نام، موبایل یا گروه..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ flexShrink: 0 }}>
            {STATUS_FILTERS.map((f) => {
              const count = countParticipantsByStatus(participants, f.value);
              return (
                <Chip
                  key={f.value}
                  label={`${f.label}${count > 0 ? ` (${count.toLocaleString("fa-IR")})` : ""}`}
                  size="small"
                  clickable
                  color={statusFilter === f.value ? "primary" : "default"}
                  variant={statusFilter === f.value ? "filled" : "outlined"}
                  onClick={() => setStatusFilter(f.value)}
                  aria-pressed={statusFilter === f.value}
                />
              );
            })}
          </Stack>
        </Stack>

        {participants.length === 0 ? (
          <EmptyState
            title="هنوز شرکت‌کننده‌ای ندارید"
            message="با افزودن گروه، جستجوی کاربر، وارد کردن لیست موبایل/کد ملی، یا اشتراک لینک دعوت، شرکت‌کنندگان را به آزمون اضافه کنید."
            icon={<PeopleIcon sx={{ fontSize: 64, color: "text.disabled" }} />}
            action={
              <Button variant="contained" startIcon={<PersonAddIcon />} onClick={onAddClick}>
                افزودن اولین شرکت‌کننده
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="موردی پیدا نشد"
            message="فیلتر یا عبارت جستجو را تغییر دهید."
          />
        ) : isMobile ? (
          <Stack spacing={1}>
            {filtered.map((p) => (
              <ParticipantMobileCard
                key={p.id}
                participant={p}
                isDescriptiveGrading={isDescriptiveGrading}
                groupAvatarById={groupAvatarById}
                canManageParticipants={canManageParticipants}
                onRemoveParticipant={onRemoveParticipant}
              />
            ))}
          </Stack>
        ) : viewMode === "all" ? (
          <ParticipantTable
            rows={filtered}
            isDescriptiveGrading={isDescriptiveGrading}
            showGroupColumn
            groupAvatarById={groupAvatarById}
            canManageParticipants={canManageParticipants}
            onRemoveParticipant={onRemoveParticipant}
          />
        ) : (
          <Stack spacing={1}>
            {Array.from(grouped.byGroup.entries()).map(([groupId, rows]) => {
              const groupName = rows[0]?.group?.name ?? "گروه";
              const avatarUrl =
                rows[0]?.group?.avatar_url ?? groupAvatarById?.get(groupId);
              return (
                <Accordion
                  key={groupId}
                  defaultExpanded
                  disableGutters
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: "12px !important",
                    "&:before": { display: "none" },
                    overflow: "hidden",
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <GroupAvatar
                        name={groupName}
                        avatarUrl={avatarUrl}
                        sx={{ width: 32, height: 32, borderRadius: 1.5, fontSize: "0.85rem" }}
                      />
                      <Typography variant="subtitle2" fontWeight={700}>
                        {groupName} ({rows.length.toLocaleString("fa-IR")})
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                    <ParticipantTable
                      rows={rows}
                      isDescriptiveGrading={isDescriptiveGrading}
                      groupAvatarById={groupAvatarById}
                      canManageParticipants={canManageParticipants}
                      onRemoveParticipant={onRemoveParticipant}
                    />
                  </AccordionDetails>
                </Accordion>
              );
            })}
            {grouped.ungrouped.length > 0 && (
              <Accordion
                disableGutters
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: "12px !important",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="subtitle2" fontWeight={700}>
                      بدون گروه ({grouped.ungrouped.length.toLocaleString("fa-IR")})
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <ParticipantTable
                    rows={grouped.ungrouped}
                    isDescriptiveGrading={isDescriptiveGrading}
                    canManageParticipants={canManageParticipants}
                    onRemoveParticipant={onRemoveParticipant}
                  />
                </AccordionDetails>
              </Accordion>
            )}
          </Stack>
        )}
      </Stack>
    </SectionCard>
  );
}
