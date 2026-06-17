"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import QuizIcon from "@mui/icons-material/Quiz";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import Breadcrumb from "@/components/Breadcrumb";
import { useToast } from "@/hooks/useToast";
import { useConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { GroupAvatarUpload } from "@/components/groups/GroupAvatarUpload";
import { GroupMembersPanel } from "@/components/groups/GroupMembersPanel";
import { GroupTeachersPanel } from "@/components/groups/GroupTeachersPanel";
import { GroupPersonStack } from "@/components/groups/GroupPersonStack";
import { GroupImportDialog } from "@/components/groups/GroupImportDialog";
import GroupCreatorAccessDialog from "@/components/groups/GroupCreatorAccessDialog";
import {
  useGroup,
  useUpdateGroup,
  useDeleteGroup,
  useAddUsersToGroup,
  useRemoveUserFromGroup,
  useImportUsersToGroup,
} from "@/hooks/useGroups";
import { useDebounce } from "@/hooks/useDebounce";
import { useUserSearch } from "@/hooks/useUserSearch";
import { useAuth } from "@/hooks";
import { useMainProgress } from "@/components/layout/MainProgressProvider";

type TabKey = "members" | "teachers" | "settings";

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const groupId = params?.id ? parseInt(params.id as string, 10) : null;

  const tabParam = (searchParams.get("tab") as TabKey) || "members";
  const [tab, setTab] = useState<TabKey>(tabParam);

  useEffect(() => {
    const fromUrl = (searchParams.get("tab") as TabKey) || "members";
    if (fromUrl === "members" || fromUrl === "teachers" || fromUrl === "settings") {
      setTab(fromUrl);
    }
  }, [searchParams]);

  const [memberFilter, setMemberFilter] = useState("");
  const [addSearch, setAddSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [accessOpen, setAccessOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const toast = useToast();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("admin");
  const { data: group, isLoading, isFetching, error, refetch } = useGroup(groupId);
  const updateMutation = useUpdateGroup();
  const deleteMutation = useDeleteGroup();
  const addUsersMutation = useAddUsersToGroup();
  const removeUserMutation = useRemoveUserFromGroup();
  const importMutation = useImportUsersToGroup();

  const debouncedAddSearch = useDebounce(addSearch, 500);
  const { data: searchResults, isLoading: isSearching } = useUserSearch(debouncedAddSearch);

  useMainProgress(isFetching && !isLoading ? { active: true } : null);

  const canEdit = useMemo(() => {
    if (!group || !user) return false;
    if (isAdmin) return true;
    return group.created_by === user.id;
  }, [group, user, isAdmin]);

  useEffect(() => {
    if (group) {
      setEditName(group.name);
      setEditDescription(group.description || "");
    }
  }, [group?.id, group?.name, group?.description]);

  const showAlert = useCallback(
    (message: string, severity: "success" | "error" | "warning") => {
      if (severity === "success") toast.success(message);
      else if (severity === "warning") toast.warning(message);
      else toast.error(message);
    },
    [toast]
  );

  const handleTabChange = (_: unknown, value: TabKey) => {
    setTab(value);
    if (groupId) {
      router.replace(`/groups/${groupId}?tab=${value}`, { scroll: false });
    }
  };

  if (isLoading || !groupId) {
    return (
      <Stack alignItems="center" py={10}>
        <CircularProgress />
      </Stack>
    );
  }

  if (error || !group) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">گروه یافت نشد یا دسترسی ندارید.</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/groups")}>
          بازگشت به لیست
        </Button>
      </Stack>
    );
  }

  const teachers = group.teachers ?? [];
  const memberCount = group.users_count ?? group.users?.length ?? 0;

  const handleSaveSettings = async () => {
    if (!editName.trim()) {
      showAlert("نام گروه الزامی است", "error");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: group.id,
        data: { name: editName, description: editDescription || undefined },
      });
      showAlert("ذخیره شد", "success");
      refetch();
    } catch (e: unknown) {
      showAlert(e instanceof Error ? e.message : "خطا در ذخیره", "error");
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: "حذف گروه",
      message: "گروه حذف شود؟ این عمل قابل بازگشت نیست.",
      confirmLabel: "حذف",
      confirmColor: "error",
    });
    if (!ok) return;
    try {
      await deleteMutation.mutateAsync(group.id);
      router.push("/groups");
    } catch (e: unknown) {
      showAlert(e instanceof Error ? e.message : "خطا در حذف", "error");
    }
  };

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Breadcrumb
          items={[
            { label: "مدیریت گروه‌ها", href: "/groups" },
            { label: group.name },
          ]}
        />
        <Button size="small" variant="text" startIcon={<ArrowBackIcon />} onClick={() => router.push("/groups")}>
          لیست گروه‌ها
        </Button>
      </Stack>

      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.background.paper, 1)} 65%)`,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2.5}
          alignItems={{ xs: "center", md: "flex-start" }}
          sx={{ p: { xs: 2, md: 2.5 } }}
        >
          <GroupAvatarUpload
            groupId={group.id}
            name={group.name}
            avatarUrl={group.avatar_url}
            size={96}
            disabled={!canEdit}
          />
          <Box sx={{ flex: 1, width: "100%", textAlign: { xs: "center", md: "start" } }}>
            <Typography variant="h5" fontWeight={800}>
              {group.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
              {group.description?.trim() || "بدون توضیحات"}
            </Typography>
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={0.75}
              justifyContent={{ xs: "center", md: "flex-start" }}
              alignItems="center"
            >
              <Chip
                size="small"
                icon={<PeopleIcon />}
                label={`${memberCount.toLocaleString("fa-IR")} عضو`}
                color="primary"
                variant="outlined"
              />
              {(group.exams_count ?? 0) > 0 && (
                <Chip
                  size="small"
                  icon={<QuizIcon />}
                  label={`${group.exams_count!.toLocaleString("fa-IR")} آزمون`}
                  variant="outlined"
                />
              )}
            </Stack>
            {teachers.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <GroupPersonStack people={teachers} maxVisible={6} size={32} />
              </Box>
            )}
          </Box>
        </Stack>
      </Card>

      <Tabs
        value={tab}
        onChange={handleTabChange}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab value="members" label="اعضا" icon={<PeopleIcon />} iconPosition="start" />
        <Tab
          value="teachers"
          label="دسترسی معلمین"
          icon={<ManageAccountsIcon />}
          iconPosition="start"
        />
        {canEdit && <Tab value="settings" label="تنظیمات" icon={<SettingsIcon />} iconPosition="start" />}
      </Tabs>

      {tab === "members" && (
        <GroupMembersPanel
          group={group}
          memberSearch={memberFilter}
          onMemberSearchChange={setMemberFilter}
          addSearchQuery={addSearch}
          onAddSearchChange={setAddSearch}
          searchResults={searchResults?.data}
          isSearching={isSearching}
          selectedUserIds={selectedUsers}
          onToggleUser={(id) =>
            setSelectedUsers((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            )
          }
          onAddUsers={async () => {
            if (selectedUsers.length === 0) return;
            try {
              await addUsersMutation.mutateAsync({ groupId: group.id, userIds: selectedUsers });
              showAlert("اعضا اضافه شدند", "success");
              setSelectedUsers([]);
              setAddSearch("");
              refetch();
            } catch (e: unknown) {
              showAlert(e instanceof Error ? e.message : "خطا", "error");
            }
          }}
          onRemoveUser={async (userId) => {
            const ok = await confirm({
              title: "حذف عضو",
              message: "این عضو از گروه حذف شود؟",
              confirmLabel: "حذف",
              confirmColor: "error",
            });
            if (!ok) return;
            try {
              await removeUserMutation.mutateAsync({ groupId: group.id, userId });
              showAlert("عضو حذف شد", "success");
              refetch();
            } catch (e: unknown) {
              showAlert(e instanceof Error ? e.message : "خطا", "error");
            }
          }}
          onImportClick={() => setImportOpen(true)}
          isAddPending={addUsersMutation.isPending}
          isRemovePending={removeUserMutation.isPending}
          canEdit={canEdit}
        />
      )}

      {tab === "teachers" && (
        <GroupTeachersPanel
          group={group}
          isAdmin={!!isAdmin}
          onManageAccess={isAdmin ? () => setAccessOpen(true) : undefined}
        />
      )}

      {tab === "settings" && canEdit && (
        <Card variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2.5 }}>
          <Stack spacing={3} maxWidth={560}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                اطلاعات گروه
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="نام گروه"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="توضیحات"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  multiline
                  minRows={3}
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={handleSaveSettings}
                  disabled={updateMutation.isPending}
                >
                  ذخیره تغییرات
                </Button>
              </Stack>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="error" gutterBottom>
                منطقه خطر
              </Typography>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                حذف گروه
              </Button>
            </Box>
          </Stack>
        </Card>
      )}

      <GroupImportDialog
        open={importOpen}
        group={group}
        file={importFile}
        isPending={importMutation.isPending}
        onClose={() => {
          setImportOpen(false);
          setImportFile(null);
        }}
        onFileChange={setImportFile}
        onImport={async () => {
          if (!importFile) return;
          try {
            const result = await importMutation.mutateAsync({ groupId: group.id, file: importFile });
            showAlert(`${result.imported.toLocaleString("fa-IR")} کاربر import شد`, "success");
            setImportOpen(false);
            setImportFile(null);
            refetch();
          } catch (e: unknown) {
            showAlert(e instanceof Error ? e.message : "خطا در import", "error");
          }
        }}
      />

      <GroupCreatorAccessDialog
        open={accessOpen}
        group={group}
        onClose={() => setAccessOpen(false)}
        onSaved={(msg) => {
          showAlert(msg, "success");
          refetch();
        }}
        onError={(msg) => showAlert(msg, "error")}
      />

      {confirmDialog}
    </Stack>
  );
}
