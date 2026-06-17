"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ParticipantSelector, {
  type ParticipantOption,
} from "@/components/exams/ParticipantSelector";
import {
  ContentPanel,
  ManageSectionHeader,
} from "@/components/exams/participants/participant-ui-shared";
import {
  useSendAdminBroadcast,
  useSendGroupMessage,
} from "@/hooks/useNotifications";
import { useToast } from "@/hooks/useToast";
import { useGroups, useGroup } from "@/hooks/useGroups";
import { useUsers } from "@/hooks/useUsers";
import { getSendableGroups } from "@/lib/notification-display";

const MAX_MESSAGE = 2000;
const MAX_TITLE = 200;

interface NotificationSendPanelProps {
  userId: number;
  canAdminBroadcast: boolean;
  canGroupSend: boolean;
}

export function NotificationSendPanel({
  userId,
  canAdminBroadcast,
  canGroupSend,
}: NotificationSendPanelProps) {
  const [adminMessage, setAdminMessage] = useState("");
  const [groupMessage, setGroupMessage] = useState("");
  const [title, setTitle] = useState("");
  const [groupId, setGroupId] = useState<number | "">("");
  const [adminRecipientSelection, setAdminRecipientSelection] = useState<number[] | "all">("all");
  const [groupRecipientSelection, setGroupRecipientSelection] = useState<number[] | "all">("all");
  const toast = useToast();

  const { data: groups = [] } = useGroups({ enabled: canGroupSend || canAdminBroadcast });
  const sendableGroups = useMemo(
    () => getSendableGroups(groups, userId, canAdminBroadcast),
    [groups, userId, canAdminBroadcast]
  );

  const selectedGroupId = typeof groupId === "number" ? groupId : null;
  const { data: selectedGroup, isLoading: groupLoading } = useGroup(selectedGroupId);

  const { data: usersData, isLoading: usersLoading } = useUsers(
    { per_page: 100 },
    { enabled: canAdminBroadcast }
  );

  const adminUsers: ParticipantOption[] = useMemo(
    () =>
      (usersData?.data ?? [])
        .filter((u) => u.id !== userId && u.is_active !== false)
        .map((u) => ({
          id: u.id,
          name: u.name,
          phone_number: u.phone_number,
          email: u.email,
        })),
    [usersData, userId]
  );

  const groupMembers: ParticipantOption[] = useMemo(
    () =>
      (selectedGroup?.users ?? []).map((u) => ({
        id: u.id,
        name: u.name,
        phone_number: u.phone_number,
        email: u.email ?? null,
      })),
    [selectedGroup]
  );

  const adminSend = useSendAdminBroadcast();
  const groupSend = useSendGroupMessage(selectedGroupId);

  const isPending = adminSend.isPending || groupSend.isPending;

  const handleAdminSend = () => {
    adminSend.mutate(
      {
        message: adminMessage.trim(),
        title: title.trim() || undefined,
        send_to_all: adminRecipientSelection === "all",
        recipient_ids:
          adminRecipientSelection === "all" ? ("all" as const) : adminRecipientSelection,
      },
      {
        onSuccess: (data) => {
          toast.success(
            `پیام به ${(data?.sent_count ?? 0).toLocaleString("fa-IR")} کاربر ارسال شد.`
          );
          setAdminMessage("");
          setTitle("");
          setAdminRecipientSelection("all");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "خطا در ارسال پیام");
        },
      }
    );
  };

  const handleGroupSend = () => {
    if (!selectedGroupId) return;

    groupSend.mutate(
      {
        message: groupMessage.trim(),
        send_to_all: groupRecipientSelection === "all",
        recipient_ids:
          groupRecipientSelection === "all" ? ("all" as const) : groupRecipientSelection,
      },
      {
        onSuccess: (data) => {
          toast.success(
            `پیام به ${(data?.sent_count ?? 0).toLocaleString("fa-IR")} عضو گروه ارسال شد.`
          );
          setGroupMessage("");
          setGroupRecipientSelection("all");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "خطا در ارسال پیام");
        },
      }
    );
  };

  return (
    <Stack spacing={2}>
      {canAdminBroadcast && (
        <ContentPanel>
          <Stack spacing={2}>
            <ManageSectionHeader
              title="اعلان سیستمی"
              description="ارسال پیام به همه کاربران یا کاربران انتخاب‌شده"
            />

            <TextField
              label="عنوان (اختیاری)"
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
              fullWidth
            />

            <TextField
              label="متن پیام"
              size="small"
              multiline
              minRows={4}
              maxRows={8}
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value.slice(0, MAX_MESSAGE))}
              placeholder="متن اعلان را بنویسید..."
              fullWidth
              helperText={`${adminMessage.length.toLocaleString("fa-IR")} / ${MAX_MESSAGE.toLocaleString("fa-IR")}`}
            />

            <Stack spacing={0.75}>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                گیرندگان
              </Typography>
              {usersLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : (
                <ParticipantSelector
                  participants={adminUsers}
                  selectedIds={adminRecipientSelection}
                  onSelectionChange={setAdminRecipientSelection}
                  disabled={isPending}
                />
              )}
            </Stack>

            <Button
              variant="contained"
              startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
              onClick={handleAdminSend}
              disabled={!adminMessage.trim() || isPending || usersLoading}
              sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
            >
              ارسال اعلان
            </Button>
          </Stack>
        </ContentPanel>
      )}

      {canGroupSend && (
        <ContentPanel>
          <Stack spacing={2}>
            <ManageSectionHeader
              title="پیام به اعضای گروه"
              description={
                canAdminBroadcast
                  ? "ارسال پیام به اعضای یک گروه"
                  : "فقط گروه‌هایی که در آن‌ها معلم هستید"
              }
            />

            <FormControl size="small" fullWidth>
              <InputLabel id="notification-group-select">گروه</InputLabel>
              <Select
                labelId="notification-group-select"
                label="گروه"
                value={groupId}
                onChange={(e) => {
                  setGroupId(e.target.value === "" ? "" : Number(e.target.value));
                  setGroupRecipientSelection("all");
                }}
              >
                {sendableGroups.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.name}
                    {g.users_count != null
                      ? ` (${g.users_count.toLocaleString("fa-IR")} عضو)`
                      : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {!selectedGroupId ? (
              <Alert severity="info" sx={{ py: 0.5 }}>
                یک گروه انتخاب کنید تا اعضا را ببینید.
              </Alert>
            ) : groupLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <>
                <TextField
                  label="متن پیام"
                  size="small"
                  multiline
                  minRows={4}
                  maxRows={8}
                  value={groupMessage}
                  onChange={(e) => setGroupMessage(e.target.value.slice(0, MAX_MESSAGE))}
                  placeholder="پیام خود را برای اعضای گروه بنویسید..."
                  fullWidth
                  helperText={`${groupMessage.length.toLocaleString("fa-IR")} / ${MAX_MESSAGE.toLocaleString("fa-IR")}`}
                />

                <Stack spacing={0.75}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    گیرندگان
                  </Typography>
                  <ParticipantSelector
                    participants={groupMembers}
                    selectedIds={groupRecipientSelection}
                    onSelectionChange={setGroupRecipientSelection}
                    disabled={isPending || groupMembers.length === 0}
                  />
                </Stack>

                <Button
                  variant="contained"
                  startIcon={
                    isPending ? <CircularProgress size={18} color="inherit" /> : <SendIcon />
                  }
                  onClick={handleGroupSend}
                  disabled={
                    !groupMessage.trim() || isPending || !selectedGroupId || groupMembers.length === 0
                  }
                  sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
                >
                  ارسال به گروه
                </Button>
              </>
            )}
          </Stack>
        </ContentPanel>
      )}

    </Stack>
  );
}
