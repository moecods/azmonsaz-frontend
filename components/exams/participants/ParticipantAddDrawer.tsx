"use client";

import {
  Box,
  Drawer,
  IconButton,
  Stack,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { ParticipantAddSection } from "@/components/exams/participants/ParticipantAddSection";
import type { ComponentProps } from "react";

type ParticipantAddSectionProps = ComponentProps<typeof ParticipantAddSection>;

interface ParticipantAddDrawerProps extends ParticipantAddSectionProps {
  open: boolean;
  onClose: () => void;
}

function SheetDragHandle() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        pt: 1.25,
        pb: 0.5,
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 4,
          borderRadius: 2,
          bgcolor: "action.disabled",
        }}
      />
    </Box>
  );
}

function DrawerHeader({ onClose, compact }: { onClose: () => void; compact?: boolean }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={1}
      sx={{
        px: 2,
        py: compact ? 1 : 1.5,
        borderBottom: 1,
        borderColor: "divider",
        flexShrink: 0,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
        <PersonAddIcon color="primary" fontSize="small" sx={{ flexShrink: 0 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            افزودن شرکت‌کننده
          </Typography>
          {!compact && (
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
              گروه، جستجو، لیست یا لینک دعوت
            </Typography>
          )}
        </Box>
      </Stack>
      <IconButton onClick={onClose} aria-label="بستن" edge="end">
        <CloseIcon />
      </IconButton>
    </Stack>
  );
}

export function ParticipantAddDrawer({ open, onClose, ...addProps }: ParticipantAddDrawerProps) {
  const theme = useTheme();
  const isMobileSheet = useMediaQuery(theme.breakpoints.down("md"));

  const modalZIndex = theme.zIndex.modal;

  if (isMobileSheet) {
    return (
      <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        variant="temporary"
        ModalProps={{
          sx: { zIndex: modalZIndex },
        }}
        PaperProps={{
          sx: {
            zIndex: modalZIndex,
            maxHeight: "min(92dvh, 720px)",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            pb: "env(safe-area-inset-bottom, 0px)",
          },
        }}
      >
        <SheetDragHandle />
        <DrawerHeader onClose={onClose} compact />
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            px: 2,
            pt: 1.5,
            pb: 2,
            WebkitOverflowScrolling: "touch",
          }}
        >
          <ParticipantAddSection {...addProps} layout="sheet" />
        </Box>
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant="temporary"
      ModalProps={{
        sx: { zIndex: modalZIndex },
      }}
      PaperProps={{
        sx: {
          zIndex: modalZIndex,
          width: { md: 560, lg: 640 },
          maxWidth: "100vw",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DrawerHeader onClose={onClose} />
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <ParticipantAddSection {...addProps} layout="drawer" />
      </Box>
    </Drawer>
  );
}
