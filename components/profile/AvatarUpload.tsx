"use client";

import { useRef, useState, ChangeEvent, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
  Alert,
  Tooltip,
  alpha,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useAuth, useDeleteAvatar, useUploadAvatar } from "@/hooks";
import { handleError } from "@/lib/error-handler";
import UserAvatar from "@/components/ui/UserAvatar";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const AVATAR_SIZE = 128;

export default function AvatarUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const uploadMutation = useUploadAvatar();
  const deleteMutation = useDeleteAvatar();
  const [preview, setPreview] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  if (!user) return null;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      handleError(new Error("فقط فایل تصویری مجاز است"), { context: "Avatar Upload" });
      return;
    }
    if (file.size > MAX_BYTES) {
      handleError(new Error("حجم فایل بیشتر از ۱۰ مگابایت مجاز نیست"), { context: "Avatar Upload" });
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setSuccessMessage(null);

    uploadMutation.mutate(file, {
      onSuccess: () => {
        setSuccessMessage("تصویر پروفایل با موفقیت ذخیره شد");
        setPreview((current) => {
          if (current) URL.revokeObjectURL(current);
          return null;
        });
        setTimeout(() => setSuccessMessage(null), 4000);
      },
      onError: (error) => {
        setPreview((current) => {
          if (current) URL.revokeObjectURL(current);
          return null;
        });
        handleError(error, { context: "Avatar Upload" });
      },
    });
  };

  const isBusy = uploadMutation.isPending || deleteMutation.isPending;

  const openPicker = () => {
    if (!isBusy) inputRef.current?.click();
  };

  const handleDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        setSuccessMessage("تصویر پروفایل حذف شد");
        setTimeout(() => setSuccessMessage(null), 4000);
      },
      onError: (error) => handleError(error, { context: "Avatar Delete" }),
    });
  };

  return (
    <Stack spacing={2} alignItems={{ xs: "center", sm: "flex-start" }}>
      <input ref={inputRef} type="file" accept={ACCEPT} hidden onChange={handleFileChange} />

      <Box
        sx={{
          position: "relative",
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          borderRadius: "50%",
          cursor: isBusy ? "wait" : "pointer",
          "&:hover .avatar-overlay": {
            opacity: isBusy ? 0 : 1,
          },
        }}
        onClick={openPicker}
        role="button"
        tabIndex={0}
        aria-label="تغییر تصویر پروفایل"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
      >
        <UserAvatar
          name={user.name}
          avatarUrl={user.avatar_url}
          previewSrc={preview}
          sx={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            fontSize: "2.25rem",
            border: 3,
            borderColor: "background.paper",
            boxShadow: 2,
          }}
        />

        <Box
          className="avatar-overlay"
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
            bgcolor: (theme) => alpha(theme.palette.common.black, 0.55),
            color: "common.white",
            opacity: 0,
            transition: "opacity 0.2s ease",
            pointerEvents: "none",
          }}
        >
          <PhotoCameraIcon fontSize="medium" />
          <Typography variant="caption" fontWeight={600}>
            {user.avatar_url || preview ? "تغییر" : "آپلود"}
          </Typography>
        </Box>

        {isBusy && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: (theme) => alpha(theme.palette.background.paper, 0.75),
            }}
          >
            <CircularProgress size={40} />
          </Box>
        )}

        <Tooltip title="تغییر تصویر">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              openPicker();
            }}
            disabled={isBusy}
            sx={{
              position: "absolute",
              bottom: 4,
              right: 4,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              boxShadow: 2,
              "&:hover": { bgcolor: "primary.dark" },
            }}
            aria-label="انتخاب تصویر"
          >
            <PhotoCameraIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Stack spacing={1} alignItems={{ xs: "center", sm: "flex-start" }} sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary" textAlign={{ xs: "center", sm: "start" }}>
          روی تصویر کلیک کنید یا دکمه دوربین را بزنید
        </Typography>
        <Typography variant="caption" color="text.disabled">
          PNG، JPG یا WEBP — حداکثر ۱۰ مگابایت
        </Typography>

        {(user.avatar_url || preview) && (
          <Button
            variant="text"
            size="small"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            disabled={isBusy}
            onClick={handleDelete}
            sx={{ alignSelf: { xs: "center", sm: "flex-start" }, mt: 0.5 }}
          >
            حذف تصویر
          </Button>
        )}
      </Stack>

      {successMessage && (
        <Alert severity="success" sx={{ width: "100%", maxWidth: 360 }}>
          {successMessage}
        </Alert>
      )}
    </Stack>
  );
}
