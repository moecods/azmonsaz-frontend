"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Chip, CircularProgress, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GroupsIcon from "@mui/icons-material/Groups";
import PeopleIcon from "@mui/icons-material/People";
import GroupOffIcon from "@mui/icons-material/GroupOff";
import Breadcrumb from "@/components/Breadcrumb";
import { Toast } from "@/components/feedback/Alert/Alert";
import { GroupCard } from "@/components/groups/GroupCard";
import { GroupFormDialog } from "@/components/groups/GroupFormDialog";
import { GroupsFiltersPanel } from "@/components/groups/GroupsFiltersPanel";
import {
  QuestionBankLayout,
  QuestionBankPageHeader,
  QuestionBankEmptyState,
} from "@/components/questions/question-bank";
import { useMainProgress } from "@/components/layout/MainProgressProvider";
import { useGroups, useCreateGroup, useUploadGroupAvatar } from "@/hooks/useGroups";
import { useAuth } from "@/hooks";
import {
  computeGroupStats,
  filterAndSortGroups,
  uniqueCreators,
  type GroupsListFilters,
} from "@/lib/groups-list-utils";

type AlertState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning";
};

const DEFAULT_FILTERS: GroupsListFilters = {
  search: "",
  size: "all",
  sort: "newest",
  creatorId: "",
};

export default function GroupsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<GroupsListFilters>(DEFAULT_FILTERS);
  const [createOpen, setCreateOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    message: "",
    severity: "success",
  });

  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("admin");
  const { data: groups = [], isLoading, isFetching } = useGroups();
  const createMutation = useCreateGroup();
  const uploadAvatarMutation = useUploadGroupAvatar();

  useMainProgress(isFetching && !isLoading ? { active: true } : null);

  const stats = useMemo(() => computeGroupStats(groups), [groups]);
  const creators = useMemo(() => uniqueCreators(groups), [groups]);
  const filteredGroups = useMemo(
    () => filterAndSortGroups(groups, filters),
    [groups, filters]
  );

  const showAlert = useCallback((message: string, severity: AlertState["severity"]) => {
    setAlert({ open: true, message, severity });
  }, []);

  const resetForm = () => {
    setGroupName("");
    setGroupDescription("");
    setPendingAvatar(null);
  };

  const closeCreateDialog = () => {
    setCreateOpen(false);
    resetForm();
  };

  const openCreate = () => {
    resetForm();
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      showAlert("لطفاً نام گروه را وارد کنید", "error");
      return;
    }
    try {
      const created = await createMutation.mutateAsync({
        name: groupName,
        description: groupDescription || undefined,
      });
      if (pendingAvatar && created?.id) {
        await uploadAvatarMutation.mutateAsync({ groupId: created.id, file: pendingAvatar });
      }
      closeCreateDialog();
      router.push(`/groups/${created.id}?tab=members`);
    } catch (e: unknown) {
      showAlert(e instanceof Error ? e.message : "خطا در ایجاد گروه", "error");
    }
  };

  return (
    <Stack spacing={2}>
      <Breadcrumb items={[{ label: "مدیریت گروه‌ها" }]} />

      <QuestionBankLayout
        header={
          <QuestionBankPageHeader
            title="مدیریت گروه‌ها"
            subtitle="روی هر کارت کلیک کنید تا اعضا و تنظیمات گروه را مدیریت کنید"
            icon={<GroupsIcon />}
            stats={
              <>
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  icon={<GroupsIcon />}
                  label={`${stats.totalGroups.toLocaleString("fa-IR")} گروه`}
                />
                <Chip
                  size="small"
                  color="secondary"
                  variant="outlined"
                  icon={<PeopleIcon />}
                  label={`${stats.totalMembers.toLocaleString("fa-IR")} عضو`}
                />
                {stats.emptyGroups > 0 && (
                  <Chip
                    size="small"
                    color="warning"
                    variant="outlined"
                    icon={<GroupOffIcon />}
                    label={`${stats.emptyGroups.toLocaleString("fa-IR")} بدون عضو`}
                  />
                )}
              </>
            }
            actions={
              <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
                گروه جدید
              </Button>
            }
          />
        }
        filters={
          <GroupsFiltersPanel
            filters={filters}
            onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
            creators={creators}
            showCreatorFilter={isAdmin}
            resultCount={filteredGroups.length}
            totalCount={groups.length}
          />
        }
      >
        {isLoading ? (
          <Stack alignItems="center" py={8}>
            <CircularProgress />
          </Stack>
        ) : filteredGroups.length === 0 ? (
          <QuestionBankEmptyState
            title={groups.length === 0 ? "هنوز گروهی ندارید" : "گروهی با این فیلتر نیست"}
            description={
              groups.length === 0
                ? "اولین گروه را بسازید؛ پس از ایجاد به صفحه گروه منتقل می‌شوید."
                : "فیلتر یا عبارت جستجو را تغییر دهید."
            }
            action={
              groups.length === 0
                ? { label: "ایجاد گروه", onClick: openCreate }
                : { label: "پاک کردن فیلترها", onClick: () => setFilters(DEFAULT_FILTERS) }
            }
          />
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                xl: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            {filteredGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </Box>
        )}
      </QuestionBankLayout>

      <GroupFormDialog
        open={createOpen}
        mode="create"
        name={groupName}
        description={groupDescription}
        pendingAvatarFile={pendingAvatar}
        onPendingAvatarChange={setPendingAvatar}
        isPending={createMutation.isPending || uploadAvatarMutation.isPending}
        onClose={closeCreateDialog}
        onNameChange={setGroupName}
        onDescriptionChange={setGroupDescription}
        onSubmit={handleCreate}
      />

      {alert.open && (
        <Toast
          open={alert.open}
          onClose={() => setAlert((a) => ({ ...a, open: false }))}
          message={alert.message}
          severity={alert.severity}
        />
      )}
    </Stack>
  );
}
