"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Chip, Card, Skeleton, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GroupsIcon from "@mui/icons-material/Groups";
import PeopleIcon from "@mui/icons-material/People";
import GroupOffIcon from "@mui/icons-material/GroupOff";
import Breadcrumb from "@/components/Breadcrumb";
import { useToast } from "@/hooks/useToast";
import { GroupCard } from "@/components/groups/GroupCard";
import { GroupFormDialog } from "@/components/groups/GroupFormDialog";
import { GroupsFiltersPanel } from "@/components/groups/GroupsFiltersPanel";
import {
  QuestionBankLayout,
  QuestionBankPageHeader,
  QuestionBankEmptyState,
} from "@/components/questions/question-bank";
import { useMainProgress } from "@/components/layout/MainProgressProvider";
import { AnimatedContent } from "@/components/feedback/AnimatedListBody";
import { useGroups, useCreateGroup, useUploadGroupAvatar } from "@/hooks/useGroups";
import { useAuth } from "@/hooks";
import {
  computeGroupStats,
  filterAndSortGroups,
  uniqueCreators,
  type GroupsListFilters,
} from "@/lib/groups-list-utils";

type AlertSeverity = "success" | "error" | "warning";

const DEFAULT_FILTERS: GroupsListFilters = {
  search: "",
  size: "all",
  sort: "newest",
  creatorId: "",
};

function GroupListSkeleton() {
  return (
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
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} variant="outlined" sx={{ borderRadius: 2.5, p: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Skeleton variant="rounded" width={52} height={52} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" height={28} width="70%" />
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="60%" />
            </Box>
          </Stack>
        </Card>
      ))}
    </Box>
  );
}

export default function GroupsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<GroupsListFilters>(DEFAULT_FILTERS);
  const [createOpen, setCreateOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const toast = useToast();

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

  const showAlert = useCallback(
    (message: string, severity: AlertSeverity) => {
      if (severity === "success") toast.success(message);
      else if (severity === "warning") toast.warning(message);
      else toast.error(message);
    },
    [toast]
  );

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
          <GroupListSkeleton />
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
          <AnimatedContent
            animationKey={`${filters.search}-${filters.size}-${filters.sort}-${filters.creatorId}`}
            loading={isFetching && !isLoading}
          >
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
          </AnimatedContent>
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
    </Stack>
  );
}
