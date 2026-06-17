"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grow,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Checkbox,
  Tooltip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import type { UserParticipant } from "@/components/exams/ParticipantManagement.types";
import { useParticipantAction } from "@/hooks/useExams";
import { getErrorMessage } from "@/lib/error-handler";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { dialogTransitionProps, pressableSx } from "@/theme/motion";

type ParticipantActionType =
  | "mark_absent"
  | "revert_absent"
  | "force_complete"
  | "extend_time"
  | "reset_attempt";

interface ParticipantActionsMenuProps {
  examId: number;
  participant: UserParticipant;
  onRemove?: (participant: UserParticipant) => void;
}

export function ParticipantActionsMenu({
  examId,
  participant,
  onRemove,
}: ParticipantActionsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmAction, setConfirmAction] = useState<ParticipantActionType | null>(null);
  const [extendMinutes, setExtendMinutes] = useState("15");
  const [clearAnswers, setClearAnswers] = useState(false);
  const [reason, setReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const actionMutation = useParticipantAction();
  const reducedMotion = useReducedMotion();

  const open = Boolean(anchorEl);
  const status = participant.status ?? "registered";

  const closeMenu = () => setAnchorEl(null);

  const closeConfirmDialog = () => {
    setConfirmAction(null);
    setActionError(null);
    actionMutation.reset();
  };

  const openConfirmAction = (action: ParticipantActionType) => {
    closeMenu();
    setActionError(null);
    actionMutation.reset();
    setConfirmAction(action);
  };

  const runAction = (action: ParticipantActionType, payload: Record<string, unknown> = {}) => {
    setActionError(null);
    actionMutation.mutate(
      {
        examId,
        participantId: participant.id,
        action,
        ...payload,
      },
      {
        onSuccess: () => {
          closeConfirmDialog();
          setReason("");
          setClearAnswers(false);
        },
        onError: (error) => {
          setActionError(getErrorMessage(error, "اقدام ناموفق بود."));
        },
      }
    );
  };

  const confirmLabels: Record<ParticipantActionType, string> = {
    mark_absent: "ثبت غیبت",
    revert_absent: "برداشتن غیبت",
    force_complete: "ثبت دستی آزمون",
    extend_time: "تمدید زمان",
    reset_attempt: "شروع مجدد",
  };

  return (
    <>
      <Tooltip title="اقدامات">
        <IconButton
          size="small"
          aria-label="اقدامات شرکت‌کننده"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={pressableSx(reducedMotion)}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        TransitionComponent={Grow}
        transitionDuration={reducedMotion ? 0 : "auto"}
      >
        {status === "registered" && (
          <>
            <MenuItem onClick={() => openConfirmAction("mark_absent")}>
              ثبت غیبت
            </MenuItem>
            <MenuItem onClick={() => openConfirmAction("extend_time")}>
              تمدید زمان
            </MenuItem>
          </>
        )}
        {status === "absent" && (
          <MenuItem onClick={() => openConfirmAction("revert_absent")}>
            برداشتن غیبت
          </MenuItem>
        )}
        {status === "started" && (
          <>
            <MenuItem onClick={() => openConfirmAction("force_complete")}>
              ثبت دستی / پایان آزمون
            </MenuItem>
            <MenuItem onClick={() => openConfirmAction("extend_time")}>
              تمدید زمان
            </MenuItem>
            <MenuItem onClick={() => openConfirmAction("reset_attempt")}>
              شروع مجدد
            </MenuItem>
          </>
        )}
        {onRemove && (
          <MenuItem
            onClick={() => {
              closeMenu();
              onRemove(participant);
            }}
            sx={{ color: "error.main" }}
          >
            حذف از آزمون
          </MenuItem>
        )}
      </Menu>

      <Dialog
        open={confirmAction !== null}
        onClose={closeConfirmDialog}
        maxWidth="xs"
        fullWidth
        TransitionProps={dialogTransitionProps(reducedMotion)}
      >
        <DialogTitle>{confirmAction ? confirmLabels[confirmAction] : ""}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {actionError && (
              <Alert severity="error" onClose={() => setActionError(null)}>
                {actionError}
              </Alert>
            )}
            <Box>
              شرکت‌کننده: <strong>{participant.user?.name ?? "—"}</strong>
            </Box>
            {confirmAction === "extend_time" && (
              <TextField
                label="دقیقه تمدید"
                type="number"
                value={extendMinutes}
                onChange={(e) => setExtendMinutes(e.target.value)}
                inputProps={{ min: 1, max: 240 }}
                fullWidth
                size="small"
              />
            )}
            {confirmAction === "reset_attempt" && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={clearAnswers}
                    onChange={(_, v) => setClearAnswers(v)}
                  />
                }
                label="پاک کردن پاسخ‌های ذخیره‌شده"
              />
            )}
            <TextField
              label="یادداشت (اختیاری)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              minRows={2}
              fullWidth
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>انصراف</Button>
          <Button
            variant="contained"
            disabled={actionMutation.isPending}
            onClick={() => {
              if (!confirmAction) return;
              const payload: Record<string, unknown> = {};
              if (reason.trim()) payload.reason = reason.trim();
              if (confirmAction === "extend_time") {
                payload.minutes = Number(extendMinutes) || 15;
              }
              if (confirmAction === "reset_attempt") {
                payload.clear_answers = clearAnswers;
              }
              runAction(confirmAction, payload);
            }}
          >
            تأیید
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
