"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { GroupAvatar } from "@/components/groups/GroupAvatar";
import { useDeleteGroupAvatar, useUploadGroupAvatar } from "@/hooks/useGroups";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

interface GroupAvatarUploadProps {
  groupId?: number | null;
  name: string;
  avatarUrl?: string | null;
  /** Create flow: parent uploads after group is created */
  pendingFile?: File | null;
  onPendingFileChange?: (file: File | null) => void;
  size?: number;
  disabled?: boolean;
}

export function GroupAvatarUpload({
  groupId,
  name,
  avatarUrl,
  pendingFile,
  onPendingFileChange,
  size = 96,
  disabled = false,
}: GroupAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadGroupAvatar();
  const deleteMutation = useDeleteGroupAvatar();
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const previewFromPending = pendingFile ? URL.createObjectURL(pendingFile) : null;

  useEffect(() => {
    return () => {
      if (previewFromPending) URL.revokeObjectURL(previewFromPending);
    };
  }, [previewFromPending]);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const previewSrc = previewFromPending ?? localPreview;
  const isBusy = uploadMutation.isPending || deleteMutation.isPending;
  const canEdit = !disabled && (!isBusy);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/") || file.size > MAX_BYTES) return;

    if (groupId) {
      uploadMutation.mutate({ groupId, file });
      return;
    }

    onPendingFileChange?.(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    if (groupId) {
      deleteMutation.mutate(groupId);
      return;
    }
    onPendingFileChange?.(null);
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
  };

  const hasImage = Boolean(avatarUrl || previewSrc || pendingFile);

  return (
    <Stack alignItems="center" spacing={1}>
      <input ref={inputRef} type="file" accept={ACCEPT} hidden onChange={handleChange} />

      <Box
        sx={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: 3,
          overflow: "hidden",
          border: "2px dashed",
          borderColor: hasImage ? "divider" : "primary.light",
          bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
        }}
      >
        <GroupAvatar
          name={name || "گروه"}
          avatarUrl={avatarUrl}
          previewSrc={previewSrc ?? undefined}
          sx={{ width: size, height: size, borderRadius: 3, fontSize: size * 0.35 }}
        />
        {canEdit && (
          <Box
            className="group-avatar-overlay"
            onClick={() => inputRef.current?.click()}
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(0,0,0,0.45)",
              opacity: 0,
              transition: "opacity 0.2s",
              cursor: "pointer",
              "&:hover": { opacity: 1 },
            }}
          >
            {isBusy ? (
              <CircularProgress size={28} sx={{ color: "common.white" }} />
            ) : (
              <PhotoCameraIcon sx={{ color: "common.white", fontSize: 28 }} />
            )}
          </Box>
        )}
      </Box>

      <Stack direction="row" spacing={0.5}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<PhotoCameraIcon />}
          disabled={!canEdit}
          onClick={() => inputRef.current?.click()}
        >
          {hasImage ? "تغییر تصویر" : "آپلود تصویر"}
        </Button>
        {hasImage && (
          <Tooltip title="حذف تصویر">
            <span>
              <IconButton size="small" onClick={handleRemove} disabled={!canEdit}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Stack>
      <Typography variant="caption" color="text.secondary" textAlign="center">
        JPG, PNG, WebP — حداکثر ۱۰ مگابایت
      </Typography>
    </Stack>
  );
}
