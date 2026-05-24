"use client";

import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import UserAvatar from "@/components/ui/UserAvatar";
import type { Group } from "@/services/groups/GroupService";

interface SearchUser {
  id: number;
  name: string;
  phone_number: string;
  national_id?: string;
  avatar_url?: string | null;
}

interface GroupMembersPanelProps {
  group: Group;
  memberSearch: string;
  onMemberSearchChange: (value: string) => void;
  addSearchQuery: string;
  onAddSearchChange: (value: string) => void;
  searchResults: SearchUser[] | undefined;
  isSearching: boolean;
  selectedUserIds: number[];
  onToggleUser: (userId: number) => void;
  onAddUsers: () => void;
  onRemoveUser: (userId: number) => void;
  onImportClick: () => void;
  isAddPending: boolean;
  isRemovePending: boolean;
  canEdit: boolean;
}

export function GroupMembersPanel({
  group,
  memberSearch,
  onMemberSearchChange,
  addSearchQuery,
  onAddSearchChange,
  searchResults,
  isSearching,
  selectedUserIds,
  onToggleUser,
  onAddUsers,
  onRemoveUser,
  onImportClick,
  isAddPending,
  isRemovePending,
  canEdit,
}: GroupMembersPanelProps) {
  const [addExpanded, setAddExpanded] = useState(false);
  const members = group.users ?? [];
  const existingIds = useMemo(() => new Set(members.map((m) => m.id)), [members]);

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.phone_number?.includes(q) ||
        m.national_id?.toLowerCase().includes(q)
    );
  }, [members, memberSearch]);

  return (
    <Stack spacing={2}>
      {canEdit && (
        <Accordion
          expanded={addExpanded}
          onChange={(_, exp) => setAddExpanded(exp)}
          disableGutters
          elevation={0}
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: "12px !important",
            "&:before": { display: "none" },
            overflow: "hidden",
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonAddIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={700}>
                افزودن عضو یا Import
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="جستجو: نام، موبایل یا کد ملی (حداقل ۳ کاراکتر)"
              value={addSearchQuery}
              onChange={(e) => onAddSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            {isSearching && (
              <Box py={2} display="flex" justifyContent="center">
                <CircularProgress size={24} />
              </Box>
            )}
            {searchResults && searchResults.length > 0 && (
              <Paper variant="outlined" sx={{ mt: 1.5, maxHeight: 220, overflow: "auto" }}>
                <List dense disablePadding>
                  {searchResults.map((user) => {
                    const inGroup = existingIds.has(user.id);
                    const selected = selectedUserIds.includes(user.id);
                    return (
                      <ListItem
                        key={user.id}
                        dense
                        sx={{ opacity: inGroup ? 0.55 : 1, py: 0.75 }}
                        secondaryAction={
                          inGroup ? (
                            <Chip label="عضو" size="small" color="success" variant="outlined" />
                          ) : (
                            <Checkbox
                              size="small"
                              checked={selected}
                              onChange={() => onToggleUser(user.id)}
                            />
                          )
                        }
                      >
                        <ListItemAvatar sx={{ minWidth: 44 }}>
                          <UserAvatar name={user.name} avatarUrl={user.avatar_url} sx={{ width: 36, height: 36 }} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.name}
                          secondary={`${user.phone_number}${user.national_id ? ` · ${user.national_id}` : ""}`}
                          primaryTypographyProps={{ fontWeight: 600, variant: "body2" }}
                          secondaryTypographyProps={{ variant: "caption" }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            )}
            {addSearchQuery.length >= 3 && !isSearching && searchResults?.length === 0 && (
              <Alert severity="info" sx={{ mt: 1.5 }}>
                کاربری یافت نشد
              </Alert>
            )}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1.5 }}>
              <Button
                variant="contained"
                startIcon={isAddPending ? <CircularProgress size={18} /> : <AddIcon />}
                disabled={selectedUserIds.length === 0 || isAddPending}
                onClick={onAddUsers}
              >
                افزودن
                {selectedUserIds.length > 0
                  ? ` ${selectedUserIds.length.toLocaleString("fa-IR")} نفر`
                  : ""}
              </Button>
              <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={onImportClick}>
                Import از Excel
              </Button>
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: "hidden" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ sm: "center" }}
          sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider", bgcolor: "action.hover" }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1 }}>
            اعضا ({members.length.toLocaleString("fa-IR")})
          </Typography>
          <TextField
            size="small"
            placeholder="جستجو در لیست…"
            value={memberSearch}
            onChange={(e) => onMemberSearchChange(e.target.value)}
            sx={{ width: { xs: "100%", sm: 240 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        {filteredMembers.length === 0 ? (
          <Box sx={{ p: 2.5 }}>
            <Alert severity={members.length === 0 ? "warning" : "info"}>
              {members.length === 0
                ? "هنوز عضوی ندارید. بخش «افزودن عضو» را باز کنید."
                : "عضوی با این جستجو یافت نشد."}
            </Alert>
          </Box>
        ) : (
          <List disablePadding sx={{ maxHeight: { md: 520 }, overflow: "auto" }}>
            {filteredMembers.map((user, index) => (
              <ListItem
                key={user.id}
                divider={index < filteredMembers.length - 1}
                sx={{ py: 1, px: 2 }}
              >
                <ListItemAvatar sx={{ minWidth: 48 }}>
                  <UserAvatar name={user.name} avatarUrl={user.avatar_url} sx={{ width: 40, height: 40 }} />
                </ListItemAvatar>
                <ListItemText
                  primary={user.name}
                  secondary={
                    <Stack component="span" direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.25 }}>
                      <Typography component="span" variant="caption" dir="ltr">
                        {user.phone_number}
                      </Typography>
                      {user.national_id && (
                        <Typography component="span" variant="caption" color="text.disabled">
                          · {user.national_id}
                        </Typography>
                      )}
                    </Stack>
                  }
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
                {canEdit && (
                  <ListItemSecondaryAction>
                    <Tooltip title="حذف از گروه">
                      <IconButton
                        edge="end"
                        size="small"
                        color="error"
                        onClick={() => onRemoveUser(user.id)}
                        disabled={isRemovePending}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Stack>
  );
}
