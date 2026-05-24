"use client";

import {
  Alert,
  Box,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import UserAvatar from "@/components/ui/UserAvatar";
import type { Group } from "@/services/groups/GroupService";

interface GroupTeachersPanelProps {
  group: Group;
  isAdmin: boolean;
  onManageAccess?: () => void;
}

export function GroupTeachersPanel({ group, isAdmin, onManageAccess }: GroupTeachersPanelProps) {
  const teachers = group.teachers ?? [];

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: "hidden" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={1}
        sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider", bgcolor: "action.hover" }}
      >
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>
            دسترسی به گروه در آزمون‌ها
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {teachers.length.toLocaleString("fa-IR")} نفر می‌توانند این گروه را به آزمون متصل کنند
          </Typography>
        </Box>
        {isAdmin && onManageAccess && (
          <Button
            size="small"
            variant="contained"
            startIcon={<ManageAccountsIcon />}
            onClick={onManageAccess}
          >
            مدیریت
          </Button>
        )}
      </Stack>

      {teachers.length === 0 ? (
        <Alert severity="info" sx={{ m: 2 }}>
          هنوز معلمی با دسترسی ثبت نشده است.
          {isAdmin && " از دکمه «مدیریت» دسترسی را تنظیم کنید."}
        </Alert>
      ) : (
        <List disablePadding>
          {teachers.map((t, index) => (
            <ListItem key={t.id} divider={index < teachers.length - 1} sx={{ py: 1.25, px: 2 }}>
              <ListItemAvatar sx={{ minWidth: 48 }}>
                <UserAvatar name={t.name} avatarUrl={t.avatar_url} sx={{ width: 40, height: 40 }} />
              </ListItemAvatar>
              <ListItemText
                primary={t.name}
                secondary={t.phone_number ?? undefined}
                primaryTypographyProps={{ fontWeight: 600 }}
                secondaryTypographyProps={{ dir: "ltr", variant: "caption" }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
