"use client";

import { useMemo, useState } from "react";
import { Stack } from "@mui/material";
import {
  useSearchUsers,
  useAddParticipantsByPhone,
  useAddParticipantsByNationalId,
  useAddSelectedParticipants,
  useAddGroupsToExam,
  useRemoveGroupFromExam,
} from "@/hooks/useExams";
import { useGroups, useCreateGroup } from "@/hooks/useGroups";
import { useDebounce } from "@/hooks/useDebounce";
import { getErrorMessage } from "@/lib/error-handler";
import { Toast } from "@/components/feedback/Alert/Alert";
import type { ParticipantManagementProps } from "@/components/exams/ParticipantManagement.types";
import type { ParticipantAddMethod } from "@/components/exams/participants/participant-ui-shared";
import type { GroupPickItem } from "@/components/exams/participants/GroupPickCard";
import { ParticipantAddDrawer } from "@/components/exams/participants/ParticipantAddDrawer";
import { ParticipantListSection } from "@/components/exams/participants/ParticipantListSection";
import { CreateGroupDialog } from "@/components/exams/participants/CreateGroupDialog";
import { RemoveGroupDialog } from "@/components/exams/participants/RemoveGroupDialog";
import { RemoveParticipantDialog } from "@/components/exams/participants/RemoveParticipantDialog";
import {
  useRemoveExamParticipant,
} from "@/hooks/useExams";
import { downloadParticipantsCsv } from "@/lib/export-participants-csv";
import type { UserParticipant } from "@/components/exams/ParticipantManagement.types";

function mergeGroupCatalog(
  examGroups: ParticipantManagementProps["groups"],
  allGroups: GroupPickItem[]
): GroupPickItem[] {
  const byId = new Map<number, GroupPickItem>();
  for (const g of allGroups) {
    byId.set(g.id, g);
  }
  for (const g of examGroups ?? []) {
    const existing = byId.get(g.id);
    byId.set(g.id, {
      id: g.id,
      name: g.name,
      description: g.description ?? existing?.description,
      users_count: g.users_count ?? existing?.users_count,
      avatar_url: g.avatar_url ?? existing?.avatar_url,
    });
  }
  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name, "fa"));
}

export default function ParticipantManagement({
  examId,
  examTitle = "exam",
  participants,
  gradingMode = "numeric_percent",
  groups = [],
  registrationLink,
  examLink,
  canManageParticipants = false,
  onSuccess,
}: ParticipantManagementProps) {
  const isDescriptiveGrading = gradingMode === "descriptive";
  const [addOpen, setAddOpen] = useState(participants.length === 0);
  const [addMethod, setAddMethod] = useState<ParticipantAddMethod>("groups");
  const [phoneNumbers, setPhoneNumbers] = useState("");
  const [nationalIds, setNationalIds] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [removeGroupTarget, setRemoveGroupTarget] = useState<GroupPickItem | null>(null);
  const [removeParticipantTarget, setRemoveParticipantTarget] =
    useState<UserParticipant | null>(null);
  const removeParticipantMutation = useRemoveExamParticipant();
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(
    examId,
    { query: debouncedSearchQuery, type: "both" },
    !!debouncedSearchQuery && debouncedSearchQuery.length >= 3
  );

  const { data: groupsData, refetch: refetchGroups } = useGroups();
  const availableGroups = useMemo(
    () =>
      mergeGroupCatalog(
        groups,
        (groupsData ?? []).map((g) => ({
          id: g.id,
          name: g.name,
          description: g.description,
          users_count: g.users_count,
          avatar_url: g.avatar_url,
        }))
      ),
    [groups, groupsData]
  );

  const attachedGroups = useMemo(
    () => availableGroups.filter((g) => groups.some((eg) => eg.id === g.id)),
    [availableGroups, groups]
  );

  const groupAvatarById = useMemo(() => {
    const map = new Map<number, string | null | undefined>();
    for (const g of availableGroups) {
      map.set(g.id, g.avatar_url);
    }
    return map;
  }, [availableGroups]);

  const examGroupIds = useMemo(() => new Set(groups.map((g) => g.id)), [groups]);
  const existingParticipantIds = useMemo(
    () => new Set(participants.map((p) => p.user?.id).filter(Boolean)),
    [participants]
  );

  const addByPhoneMutation = useAddParticipantsByPhone();
  const addByNationalIdMutation = useAddParticipantsByNationalId();
  const addSelectedMutation = useAddSelectedParticipants();
  const addGroupsMutation = useAddGroupsToExam();
  const removeGroupMutation = useRemoveGroupFromExam();
  const createGroupMutation = useCreateGroup();

  const showToast = (message: string, severity: "success" | "error") => {
    setToast({ open: true, message, severity });
  };

  const openAdd = () => setAddOpen(true);

  const handleMethodChange = (method: ParticipantAddMethod) => {
    setAddMethod(method);
    setPhoneNumbers("");
    setNationalIds("");
    setSearchQuery("");
    setSelectedUsers([]);
    setSelectedGroups([]);
  };

  const handleAddSuccess = () => {
    onSuccess?.();
  };

  const handleAddByPhone = async () => {
    const phoneList = phoneNumbers
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);
    if (phoneList.length === 0) {
      showToast("حداقل یک شماره موبایل وارد کنید", "error");
      return;
    }
    try {
      const result = await addByPhoneMutation.mutateAsync({
        examId,
        data: { phone_numbers: phoneList },
      });
      showToast(
        `${result.added} نفر اضافه شد · ${result.skipped} نفر از قبل بودند`,
        "success"
      );
      setPhoneNumbers("");
      handleAddSuccess();
    } catch (error) {
      showToast(getErrorMessage(error, "خطا در افزودن"), "error");
    }
  };

  const handleAddByNationalId = async () => {
    const idList = nationalIds
      .split("\n")
      .map((id) => id.trim())
      .filter(Boolean);
    if (idList.length === 0) {
      showToast("حداقل یک کد ملی وارد کنید", "error");
      return;
    }
    try {
      const result = await addByNationalIdMutation.mutateAsync({
        examId,
        data: { national_ids: idList },
      });
      showToast(
        `${result.added} نفر اضافه شد · ${result.skipped} نفر از قبل بودند`,
        "success"
      );
      setNationalIds("");
      handleAddSuccess();
    } catch (error) {
      showToast(getErrorMessage(error, "خطا در افزودن"), "error");
    }
  };

  const handleAddSelected = async () => {
    if (selectedUsers.length === 0) {
      showToast("حداقل یک کاربر انتخاب کنید", "error");
      return;
    }
    try {
      const result = await addSelectedMutation.mutateAsync({
        examId,
        data: { user_ids: selectedUsers },
      });
      showToast(
        `${result.added} نفر اضافه شد · ${result.skipped} نفر از قبل بودند`,
        "success"
      );
      setSelectedUsers([]);
      setSearchQuery("");
      handleAddSuccess();
    } catch (error) {
      showToast(getErrorMessage(error, "خطا در افزودن"), "error");
    }
  };

  const handleAddGroups = async () => {
    if (selectedGroups.length === 0) {
      showToast("حداقل یک گروه انتخاب کنید", "error");
      return;
    }
    try {
      const result = await addGroupsMutation.mutateAsync({
        examId,
        data: { group_ids: selectedGroups },
      });
      showToast(
        `${result.groups_added} گروه و ${result.total_users} کاربر اضافه شدند`,
        "success"
      );
      setSelectedGroups([]);
      handleAddSuccess();
    } catch (error) {
      showToast(getErrorMessage(error, "خطا در افزودن گروه"), "error");
    }
  };

  const handleRemoveGroup = (groupId: number) => {
    const group = availableGroups.find((g) => g.id === groupId) ?? null;
    setRemoveGroupTarget(group);
  };

  const confirmRemoveGroup = async () => {
    if (!removeGroupTarget) return;
    try {
      const result = await removeGroupMutation.mutateAsync({
        examId,
        groupId: removeGroupTarget.id,
      });
      const removed = result?.participants_removed ?? 0;
      showToast(
        removed > 0 ? `گروه حذف شد · ${removed} شرکت‌کننده خارج شد` : "گروه از آزمون حذف شد",
        "success"
      );
      setRemoveGroupTarget(null);
      onSuccess?.();
    } catch (error) {
      showToast(getErrorMessage(error, "خطا در حذف گروه"), "error");
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      showToast("نام گروه الزامی است", "error");
      return;
    }
    try {
      await createGroupMutation.mutateAsync({
        name: newGroupName,
        description: newGroupDescription || undefined,
      });
      await refetchGroups();
      showToast("گروه ایجاد شد", "success");
      setCreateGroupOpen(false);
      setNewGroupName("");
      setNewGroupDescription("");
      onSuccess?.();
    } catch (error) {
      showToast(getErrorMessage(error, "خطا در ایجاد گروه"), "error");
    }
  };

  const handleCopyRegistrationLink = () => {
    if (registrationLink) {
      navigator.clipboard.writeText(registrationLink);
      showToast("لینک ثبت‌نام کپی شد", "success");
    }
  };

  const handleCopyExamLink = () => {
    if (examLink) {
      navigator.clipboard.writeText(examLink);
      showToast("لینک آزمون کپی شد", "success");
    }
  };

  const addSectionProps = {
    method: addMethod,
    onMethodChange: handleMethodChange,
    layout: "drawer" as const,
    registrationLink,
    examLink,
    onCopyRegistration: handleCopyRegistrationLink,
    onCopyExam: handleCopyExamLink,
    availableGroups,
    examGroupIds,
    selectedGroupIds: selectedGroups,
    onToggleGroup: (id: number) =>
      setSelectedGroups((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      ),
    onAddGroups: handleAddGroups,
    onRemoveGroup: handleRemoveGroup,
    onCreateGroup: () => setCreateGroupOpen(true),
    isAddingGroups: addGroupsMutation.isPending,
    isRemovingGroup: removeGroupMutation.isPending,
    phoneNumbers,
    onPhoneChange: setPhoneNumbers,
    onAddByPhone: handleAddByPhone,
    isAddingPhone: addByPhoneMutation.isPending,
    nationalIds,
    onNationalIdsChange: setNationalIds,
    onAddByNationalId: handleAddByNationalId,
    isAddingNationalId: addByNationalIdMutation.isPending,
    searchQuery,
    onSearchChange: setSearchQuery,
    searchResults: searchResults?.data,
    isSearching,
    selectedUserIds: selectedUsers,
    existingParticipantIds,
    onToggleUser: (id: number) =>
      setSelectedUsers((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      ),
    onAddSelected: handleAddSelected,
    isAddingSelected: addSelectedMutation.isPending,
  };

  return (
    <Stack spacing={2}>
      <ParticipantListSection
        participants={participants}
        isDescriptiveGrading={isDescriptiveGrading}
        groupAvatarById={groupAvatarById}
        attachedGroups={attachedGroups}
        onAddClick={openAdd}
        canManageParticipants={canManageParticipants}
        onRemoveParticipant={(p) => setRemoveParticipantTarget(p)}
        onExportCsv={() => downloadParticipantsCsv(participants, examTitle)}
      />

      <ParticipantAddDrawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        {...addSectionProps}
      />

      <CreateGroupDialog
        open={createGroupOpen}
        name={newGroupName}
        description={newGroupDescription}
        onNameChange={setNewGroupName}
        onDescriptionChange={setNewGroupDescription}
        onClose={() => setCreateGroupOpen(false)}
        onSubmit={handleCreateGroup}
        isPending={createGroupMutation.isPending}
      />

      <RemoveGroupDialog
        open={Boolean(removeGroupTarget)}
        groupName={removeGroupTarget?.name}
        isPending={removeGroupMutation.isPending}
        onClose={() => setRemoveGroupTarget(null)}
        onConfirm={confirmRemoveGroup}
      />

      <RemoveParticipantDialog
        open={Boolean(removeParticipantTarget)}
        participantName={removeParticipantTarget?.user?.name ?? "شرکت‌کننده"}
        isPending={removeParticipantMutation.isPending}
        onClose={() => setRemoveParticipantTarget(null)}
        onConfirm={() => {
          if (!removeParticipantTarget) return;
          removeParticipantMutation.mutate(
            { examId, participantId: removeParticipantTarget.id },
            {
              onSuccess: () => {
                setRemoveParticipantTarget(null);
                showToast("شرکت‌کننده حذف شد", "success");
                onSuccess?.();
              },
              onError: (err) => {
                showToast(getErrorMessage(err), "error");
              },
            }
          );
        }}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </Stack>
  );
}
