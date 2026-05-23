"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useUsers } from "@/hooks/useUsers";
import { useGroupCreatorAccess, useSyncGroupCreatorAccess } from "@/hooks/useGroupCreatorAccess";
import type { User } from "@/types";
import type { Group } from "@/services/groups/GroupService";

interface GroupCreatorAccessDialogProps {
  open: boolean;
  group: Group | null;
  onClose: () => void;
  onSaved?: (message: string) => void;
  onError?: (message: string) => void;
}

export default function GroupCreatorAccessDialog({
  open,
  group,
  onClose,
  onSaved,
  onError,
}: GroupCreatorAccessDialogProps) {
  const groupId = group?.id ?? null;
  const {
    data: accessRows,
    isLoading: accessLoading,
    isError: accessError,
    error: accessErrorDetail,
  } = useGroupCreatorAccess(groupId, open);
  const { data: usersData, isLoading: usersLoading, isError: usersError } = useUsers(
    { per_page: 100 },
    { enabled: open }
  );
  const syncMutation = useSyncGroupCreatorAccess();
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<number[]>([]);

  const creators = useMemo(() => {
    const list = usersData?.data ?? [];
    return list.filter((u: User) =>
      u.roles?.some((r) => r === "creator" || r === "admin")
    );
  }, [usersData]);

  useEffect(() => {
    if (!open) {
      setSelectedCreatorIds([]);
      return;
    }
    if (accessRows) {
      setSelectedCreatorIds(accessRows.map((row) => row.user_id));
    }
  }, [open, accessRows]);

  const handleSave = () => {
    if (!groupId) return;
    syncMutation.mutate(
      { groupId, userIds: selectedCreatorIds },
      {
        onSuccess: () => {
          onSaved?.("دسترسی معلمین ذخیره شد.");
          onClose();
        },
        onError: (err) => {
          onError?.(err instanceof Error ? err.message : "خطا در ذخیره دسترسی");
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>دسترسی معلمین — {group?.name ?? ""}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            معلمانی که می‌توانند این گروه را به آزمون‌های خود اضافه کنند.
          </Typography>

          {accessError && (
            <Alert severity="error">
              {accessErrorDetail instanceof Error
                ? accessErrorDetail.message
                : "خطا در بارگذاری دسترسی‌ها"}
            </Alert>
          )}

          {usersError && (
            <Alert severity="error">خطا در بارگذاری لیست معلمین</Alert>
          )}

          {accessLoading || usersLoading ? (
            <Stack alignItems="center" py={2}>
              <CircularProgress size={28} />
            </Stack>
          ) : (
            <Autocomplete
              multiple
              options={creators}
              getOptionLabel={(o) =>
                `${o.name}${o.phone_number ? ` · ${o.phone_number}` : ""}`
              }
              isOptionEqualToValue={(a, b) => a.id === b.id}
              value={creators.filter((c) => selectedCreatorIds.includes(c.id))}
              onChange={(_, value) => setSelectedCreatorIds(value.map((v) => v.id))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="معلمین مجاز"
                  placeholder="انتخاب معلم…"
                />
              )}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>انصراف</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={syncMutation.isPending || accessLoading || !groupId}
        >
          {syncMutation.isPending ? "در حال ذخیره…" : "ذخیره"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
