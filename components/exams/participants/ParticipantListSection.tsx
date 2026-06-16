"use client";

import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Stack,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleIcon from "@mui/icons-material/People";
import { EmptyState } from "@/components/feedback/PageStates";
import { GroupAvatar } from "@/components/groups/GroupAvatar";
import type { UserParticipant } from "@/components/exams/ParticipantManagement.types";
import type { GroupPickItem } from "@/components/exams/participants/GroupPickCard";
import {
  ParticipantSectionHeader,
  ParticipantListColumnHeader,
} from "@/components/exams/participants/ParticipantSectionHeader";
import { ParticipantRow } from "@/components/exams/participants/ParticipantRow";
import { ParticipantDesktopTable } from "@/components/exams/participants/ParticipantDesktopTable";
import {
  participantGridOptionsFromProps,
} from "@/components/exams/participants/participant-grid-columns";
import {
  computeParticipantListStats,
  filterParticipantsByStatus,
  type ParticipantStatusFilter,
} from "@/lib/participant-list-stats";

interface ParticipantListSectionProps {
  examId: number;
  participants: UserParticipant[];
  isDescriptiveGrading: boolean;
  groupAvatarById?: Map<number, string | null | undefined>;
  attachedGroups?: GroupPickItem[];
  onAddClick: () => void;
  canManageParticipants?: boolean;
  onRemoveParticipant?: (participant: UserParticipant) => void;
  onExportCsv?: () => void;
}

function ParticipantListBody({
  examId,
  rows,
  isDescriptiveGrading,
  groupAvatarById,
  canManageParticipants,
  onRemoveParticipant,
  showGroup = true,
  embedded = false,
}: {
  examId: number;
  rows: UserParticipant[];
  isDescriptiveGrading: boolean;
  groupAvatarById?: Map<number, string | null | undefined>;
  canManageParticipants?: boolean;
  onRemoveParticipant?: (participant: UserParticipant) => void;
  showGroup?: boolean;
  embedded?: boolean;
}) {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("lg"));
  const showActions = Boolean(canManageParticipants && onRemoveParticipant);
  const gridOptions = participantGridOptionsFromProps({
    showGroup,
    isDescriptiveGrading,
    canManageParticipants,
    onRemoveParticipant,
  });

  const list = (
    <>
      <ParticipantListColumnHeader
        showGroup={showGroup}
        isDescriptiveGrading={isDescriptiveGrading}
        showActions={showActions}
      />
      {rows.map((p, i) => (
        <ParticipantRow
          key={p.id}
          examId={examId}
          participant={p}
          isDescriptiveGrading={isDescriptiveGrading}
          groupAvatarById={groupAvatarById}
          canManageParticipants={canManageParticipants}
          onRemoveParticipant={onRemoveParticipant}
          showGroup={showGroup}
          isLast={i === rows.length - 1}
        />
      ))}
    </>
  );

  if (embedded) {
    return isCompact ? (
      <Box sx={{ py: 1 }}>{list}</Box>
    ) : (
      <ParticipantDesktopTable gridOptions={gridOptions} embedded>
        {list}
      </ParticipantDesktopTable>
    );
  }

  if (isCompact) {
    return <Box sx={{ py: 0.5 }}>{list}</Box>;
  }

  return (
    <ParticipantDesktopTable gridOptions={gridOptions}>{list}</ParticipantDesktopTable>
  );
}

export function ParticipantListSection({
  examId,
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
  const attachedGroupCount = attachedGroups.length;
  const [viewMode, setViewMode] = useState<"all" | "grouped">("all");
  const [statusFilter, setStatusFilter] = useState<ParticipantStatusFilter>("all");
  const [filter, setFilter] = useState("");

  const stats = useMemo(() => computeParticipantListStats(participants), [participants]);

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
      const nationalId = p.user?.national_id ?? "";
      const group = p.group?.name?.toLowerCase() ?? "";
      return (
        name.includes(q) ||
        phone.includes(q) ||
        nationalId.includes(q) ||
        group.includes(q)
      );
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

  return (
    <Stack spacing={1.5}>
      <ParticipantSectionHeader
        stats={stats}
        filteredCount={filtered.length}
        totalCount={participants.length}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        search={filter}
        onSearchChange={setFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={attachedGroupCount > 0}
        attachedGroups={attachedGroups}
        onAddClick={onAddClick}
        onExportCsv={onExportCsv}
      />

      {participants.length === 0 ? (
        <Box
          sx={{
            py: 5,
            px: 2,
            textAlign: "center",
            borderRadius: 2.5,
            border: "1px dashed",
            borderColor: "divider",
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <EmptyState
            title="هنوز شرکت‌کننده‌ای ندارید"
            message="با افزودن گروه، جستجوی کاربر، یا وارد کردن لیست موبایل/کد ملی شروع کنید."
            icon={<PeopleIcon sx={{ fontSize: 48, color: "text.disabled" }} />}
            action={
              <Button variant="contained" startIcon={<PersonAddIcon />} onClick={onAddClick} sx={{ mt: 1 }}>
                افزودن اولین شرکت‌کننده
              </Button>
            }
          />
        </Box>
      ) : filtered.length === 0 ? (
        <EmptyState title="موردی پیدا نشد" message="فیلتر یا عبارت جستجو را تغییر دهید." />
      ) : viewMode === "all" ? (
        <ParticipantListBody
          examId={examId}
          rows={filtered}
          isDescriptiveGrading={isDescriptiveGrading}
          groupAvatarById={groupAvatarById}
          canManageParticipants={canManageParticipants}
          onRemoveParticipant={onRemoveParticipant}
        />
      ) : (
        <Stack spacing={1}>
          {Array.from(grouped.byGroup.entries()).map(([groupId, rows]) => {
            const groupName = rows[0]?.group?.name ?? "گروه";
            const avatarUrl = rows[0]?.group?.avatar_url ?? groupAvatarById?.get(groupId);
            return (
              <Accordion
                key={groupId}
                defaultExpanded
                disableGutters
                elevation={0}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: "10px !important",
                  overflow: "hidden",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ minHeight: 48, px: 2, bgcolor: alpha(theme.palette.primary.main, 0.03) }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <GroupAvatar
                      name={groupName}
                      avatarUrl={avatarUrl}
                      sx={{ width: 32, height: 32, borderRadius: 1.5, fontSize: "0.8rem" }}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        {groupName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {rows.length.toLocaleString("fa-IR")} نفر
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <ParticipantListBody
                    examId={examId}
                    rows={rows}
                    isDescriptiveGrading={isDescriptiveGrading}
                    groupAvatarById={groupAvatarById}
                    canManageParticipants={canManageParticipants}
                    onRemoveParticipant={onRemoveParticipant}
                    showGroup={false}
                    embedded
                  />
                </AccordionDetails>
              </Accordion>
            );
          })}
          {grouped.ungrouped.length > 0 && (
            <Accordion
              disableGutters
              elevation={0}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: "10px !important",
                overflow: "hidden",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ minHeight: 48, px: 2, bgcolor: alpha(theme.palette.primary.main, 0.03) }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <PeopleIcon fontSize="small" color="action" />
                  <Typography variant="body2" fontWeight={700}>
                    بدون گروه ({grouped.ungrouped.length.toLocaleString("fa-IR")})
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <ParticipantListBody
                  examId={examId}
                  rows={grouped.ungrouped}
                  isDescriptiveGrading={isDescriptiveGrading}
                  canManageParticipants={canManageParticipants}
                  onRemoveParticipant={onRemoveParticipant}
                  showGroup={false}
                  embedded
                />
              </AccordionDetails>
            </Accordion>
          )}
        </Stack>
      )}
    </Stack>
  );
}
