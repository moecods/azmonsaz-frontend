"use client";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import type { Group } from "@/services/groups/GroupService";

interface SearchUser {
  id: number;
  name: string;
  phone_number: string;
  national_id?: string;
}

interface GroupMembersDialogProps {
  open: boolean;
  group: Group | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchResults: SearchUser[] | undefined;
  isSearching: boolean;
  selectedUserIds: number[];
  existingUserIds: number[];
  isAddPending: boolean;
  isRemovePending: boolean;
  onClose: () => void;
  onToggleUser: (userId: number) => void;
  onAddUsers: () => void;
  onRemoveUser: (userId: number) => void;
}

export function GroupMembersDialog({
  open,
  group,
  searchQuery,
  onSearchChange,
  searchResults,
  isSearching,
  selectedUserIds,
  existingUserIds,
  isAddPending,
  isRemovePending,
  onClose,
  onToggleUser,
  onAddUsers,
  onRemoveUser,
}: GroupMembersDialogProps) {
  const members = group?.users ?? [];
  const memberCount = group?.users_count ?? members.length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">مدیریت اعضا</Typography>
            <Typography variant="body2" color="text.secondary">
              {group?.name} — {memberCount.toLocaleString("fa-IR")} عضو
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="بستن">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 0.5 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              افزودن عضو
            </Typography>
            <TextField
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="جستجو با نام، شماره تلفن یا کد ملی (حداقل ۳ کاراکتر)"
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <SearchIcon sx={{ me: 1, color: "text.secondary" }} />,
              }}
            />
            {isSearching && (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            )}
            {searchResults && searchResults.length > 0 && (
              <Paper variant="outlined" sx={{ mt: 1.5, maxHeight: 220, overflow: "auto" }}>
                <List dense disablePadding>
                  {searchResults.map((user) => {
                    const isSelected = selectedUserIds.includes(user.id);
                    const isAlreadyInGroup = existingUserIds.includes(user.id);
                    return (
                      <ListItem
                        key={user.id}
                        secondaryAction={
                          <Checkbox
                            edge="end"
                            checked={isSelected}
                            onChange={() => onToggleUser(user.id)}
                            disabled={isAlreadyInGroup}
                          />
                        }
                        disablePadding
                      >
                        <ListItemButton
                          onClick={() => !isAlreadyInGroup && onToggleUser(user.id)}
                          disabled={isAlreadyInGroup}
                        >
                          <ListItemText
                            primary={user.name}
                            secondary={
                              <Box component="span" sx={{ display: "block" }}>
                                <Typography component="span" variant="caption" color="text.secondary">
                                  {user.phone_number}
                                  {user.national_id ? ` · ${user.national_id}` : ""}
                                </Typography>
                              </Box>
                            }
                            secondaryTypographyProps={{ component: "div" }}
                          />
                          {isAlreadyInGroup && (
                            <Chip label="در گروه" size="small" color="success" sx={{ ml: 1 }} />
                          )}
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            )}
            {searchQuery.length >= 3 && !isSearching && searchResults?.length === 0 && (
              <Alert severity="info" sx={{ mt: 1.5 }}>
                نتیجه‌ای یافت نشد
              </Alert>
            )}
            {selectedUserIds.length > 0 && (
              <Button
                variant="contained"
                fullWidth
                onClick={onAddUsers}
                disabled={isAddPending}
                startIcon={isAddPending ? <CircularProgress size={20} /> : <AddIcon />}
                sx={{ mt: 2 }}
              >
                {isAddPending
                  ? "در حال افزودن…"
                  : `افزودن ${selectedUserIds.length.toLocaleString("fa-IR")} کاربر`}
              </Button>
            )}
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              اعضای فعلی ({memberCount.toLocaleString("fa-IR")})
            </Typography>
            {members.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>نام</TableCell>
                      <TableCell>شماره تماس</TableCell>
                      <TableCell>کد ملی</TableCell>
                      <TableCell align="center" width={72}>
                        حذف
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {members.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.phone_number}</TableCell>
                        <TableCell>{user.national_id || "—"}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onRemoveUser(user.id)}
                            disabled={isRemovePending}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">این گروه هنوز عضوی ندارد.</Alert>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>بستن</Button>
      </DialogActions>
    </Dialog>
  );
}
