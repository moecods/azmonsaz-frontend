"use client";

import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import type { GroupPickItem } from "@/components/exams/participants/GroupPickCard";
import { ParticipantAddMethodNav } from "@/components/exams/participants/ParticipantAddMethodNav";
import { ParticipantLinksTab } from "@/components/exams/participants/tabs/ParticipantLinksTab";
import { ParticipantGroupsTab } from "@/components/exams/participants/tabs/ParticipantGroupsTab";
import { ParticipantBulkTab } from "@/components/exams/participants/tabs/ParticipantBulkTab";
import { ParticipantSearchTab } from "@/components/exams/participants/tabs/ParticipantSearchTab";
import {
  PARTICIPANT_ADD_METHODS,
  type ParticipantAddMethod,
} from "@/components/exams/participants/participant-ui-shared";
import type { SearchUserResult } from "@/components/exams/ParticipantManagement.types";

interface ParticipantAddSectionProps {
  method: ParticipantAddMethod;
  onMethodChange: (m: ParticipantAddMethod) => void;
  layout?: "drawer" | "inline" | "sheet";
  registrationLink?: string | null;
  examLink?: string | null;
  onCopyRegistration: () => void;
  onCopyExam: () => void;
  availableGroups: GroupPickItem[];
  examGroupIds: Set<number>;
  selectedGroupIds: number[];
  onToggleGroup: (id: number) => void;
  onAddGroups: () => void;
  onRemoveGroup: (id: number) => void;
  onCreateGroup: () => void;
  isAddingGroups: boolean;
  isRemovingGroup: boolean;
  phoneNumbers: string;
  onPhoneChange: (v: string) => void;
  onAddByPhone: () => void;
  isAddingPhone: boolean;
  nationalIds: string;
  onNationalIdsChange: (v: string) => void;
  onAddByNationalId: () => void;
  isAddingNationalId: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchResults: SearchUserResult[] | undefined;
  isSearching: boolean;
  selectedUserIds: number[];
  existingParticipantIds: Set<number | undefined>;
  onToggleUser: (id: number) => void;
  onAddSelected: () => void;
  isAddingSelected: boolean;
}

export function ParticipantAddSection(props: ParticipantAddSectionProps) {
  const theme = useTheme();
  const isWideDrawer = useMediaQuery(theme.breakpoints.up("md"));
  const layout = props.layout ?? "inline";
  const methodMeta = PARTICIPANT_ADD_METHODS.find((m) => m.value === props.method);
  const navLayout =
    layout === "sheet" ? "sheet" : layout === "drawer" ? "drawer" : "inline";

  const renderPanel = () => {
    switch (props.method) {
      case "links":
        return (
          <ParticipantLinksTab
            registrationLink={props.registrationLink}
            examLink={props.examLink}
            onCopyRegistration={props.onCopyRegistration}
            onCopyExam={props.onCopyExam}
          />
        );
      case "groups":
        return (
          <ParticipantGroupsTab
            availableGroups={props.availableGroups}
            examGroupIds={props.examGroupIds}
            selectedGroupIds={props.selectedGroupIds}
            onToggleGroup={props.onToggleGroup}
            onAddGroups={props.onAddGroups}
            onRemoveGroup={props.onRemoveGroup}
            onCreateGroup={props.onCreateGroup}
            isAdding={props.isAddingGroups}
            isRemoving={props.isRemovingGroup}
            compact={layout === "drawer" || layout === "sheet"}
          />
        );
      case "phone":
        return (
          <ParticipantBulkTab
            mode="phone"
            value={props.phoneNumbers}
            onChange={props.onPhoneChange}
            onSubmit={props.onAddByPhone}
            isPending={props.isAddingPhone}
          />
        );
      case "national_id":
        return (
          <ParticipantBulkTab
            mode="national_id"
            value={props.nationalIds}
            onChange={props.onNationalIdsChange}
            onSubmit={props.onAddByNationalId}
            isPending={props.isAddingNationalId}
          />
        );
      case "search":
        return (
          <ParticipantSearchTab
            searchQuery={props.searchQuery}
            onSearchChange={props.onSearchChange}
            searchResults={props.searchResults}
            isSearching={props.isSearching}
            selectedUserIds={props.selectedUserIds}
            existingParticipantIds={props.existingParticipantIds}
            onToggleUser={props.onToggleUser}
            onAddSelected={props.onAddSelected}
            isAdding={props.isAddingSelected}
          />
        );
      default:
        return null;
    }
  };

  const methodDescription = methodMeta ? (
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.6 }}>
      {methodMeta.description}
    </Typography>
  ) : null;

  const contentPanel = (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      {layout !== "sheet" && methodDescription}
      {renderPanel()}
    </Box>
  );

  if (layout === "sheet") {
    return (
      <Stack spacing={1.5}>
        <ParticipantAddMethodNav
          value={props.method}
          onChange={props.onMethodChange}
          layout="sheet"
        />
        {methodDescription}
        {contentPanel}
      </Stack>
    );
  }

  if (layout === "drawer" && isWideDrawer) {
    return (
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <ParticipantAddMethodNav
          value={props.method}
          onChange={props.onMethodChange}
          layout="drawer"
        />
        {contentPanel}
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <ParticipantAddMethodNav
        value={props.method}
        onChange={props.onMethodChange}
        layout={navLayout}
      />
      {contentPanel}
    </Stack>
  );
}
