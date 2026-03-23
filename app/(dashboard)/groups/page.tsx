"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Checkbox,
  Divider,
} from '@mui/material';
import {
  useGroups,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useAddUsersToGroup,
  useRemoveUserFromGroup,
  useImportUsersToGroup,
} from '@/hooks/useGroups';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services';
import { useDebounce } from '@/hooks/useDebounce';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import Breadcrumb from '@/components/Breadcrumb';
import {Toast} from '@/components/feedback/Alert/Alert';

export default function GroupsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: groups, isLoading, refetch } = useGroups();
  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();
  const deleteGroupMutation = useDeleteGroup();
  const addUsersMutation = useAddUsersToGroup();
  const removeUserMutation = useRemoveUserFromGroup();
  const importUsersMutation = useImportUsersToGroup();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['users', 'search', debouncedSearchQuery],
    queryFn: async () => {
      if (!debouncedSearchQuery || debouncedSearchQuery.length < 3) return null;
      const response = await userService.searchUsers({ query: debouncedSearchQuery, type: 'both' });
      if (!response.success) {
        throw new Error(response.message || 'Failed to search users');
      }
      return { data: response.data || [] };
    },
    enabled: !!debouncedSearchQuery && debouncedSearchQuery.length >= 3,
  });

  const handleOpenCreate = () => {
    setGroupName('');
    setGroupDescription('');
    setCreateDialogOpen(true);
  };

  const handleOpenEdit = (group: any) => {
    setSelectedGroup(group.id);
    setGroupName(group.name);
    setGroupDescription(group.description || '');
    setEditDialogOpen(true);
  };

  const handleOpenUsers = (group: any) => {
    setSelectedGroup(group.id);
    setSearchQuery('');
    setSelectedUsers([]);
    setUsersDialogOpen(true);
  };

  const handleOpenImport = (group: any) => {
    setSelectedGroup(group.id);
    setImportFile(null);
    setImportDialogOpen(true);
  };

  const handleCloseDialogs = () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setUsersDialogOpen(false);
    setImportDialogOpen(false);
    setSelectedGroup(null);
    setGroupName('');
    setGroupDescription('');
    setSearchQuery('');
    setSelectedUsers([]);
    setImportFile(null);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setAlert({
        open: true,
        message: 'لطفاً نام گروه را وارد کنید',
        severity: 'error',
      });
      return;
    }

    try {
      await createGroupMutation.mutateAsync({
        name: groupName,
        description: groupDescription || undefined,
      });
      setAlert({
        open: true,
        message: 'گروه با موفقیت ایجاد شد',
        severity: 'success',
      });
      handleCloseDialogs();
      refetch();
    } catch (error: any) {
      setAlert({
        open: true,
        message: error.message || 'خطا در ایجاد گروه',
        severity: 'error',
      });
    }
  };

  const handleUpdateGroup = async () => {
    if (!groupName.trim() || !selectedGroup) {
      setAlert({
        open: true,
        message: 'لطفاً نام گروه را وارد کنید',
        severity: 'error',
      });
      return;
    }

    try {
      await updateGroupMutation.mutateAsync({
        id: selectedGroup,
        data: {
          name: groupName,
          description: groupDescription || undefined,
        },
      });
      setAlert({
        open: true,
        message: 'گروه با موفقیت به‌روزرسانی شد',
        severity: 'success',
      });
      handleCloseDialogs();
      refetch();
    } catch (error: any) {
      setAlert({
        open: true,
        message: error.message || 'خطا در به‌روزرسانی گروه',
        severity: 'error',
      });
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm('آیا از حذف این گروه اطمینان دارید؟')) return;

    try {
      await deleteGroupMutation.mutateAsync(groupId);
      setAlert({
        open: true,
        message: 'گروه با موفقیت حذف شد',
        severity: 'success',
      });
      refetch();
    } catch (error: any) {
      setAlert({
        open: true,
        message: error.message || 'خطا در حذف گروه',
        severity: 'error',
      });
    }
  };

  const handleToggleUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddUsers = async () => {
    if (!selectedGroup || selectedUsers.length === 0) {
      setAlert({
        open: true,
        message: 'لطفاً حداقل یک کاربر انتخاب کنید',
        severity: 'error',
      });
      return;
    }

    try {
      await addUsersMutation.mutateAsync({
        groupId: selectedGroup,
        userIds: selectedUsers,
      });
      setAlert({
        open: true,
        message: `${selectedUsers.length} کاربر با موفقیت به گروه اضافه شدند`,
        severity: 'success',
      });
      setSelectedUsers([]);
      setSearchQuery('');
      refetch();
    } catch (error: any) {
      setAlert({
        open: true,
        message: error.message || 'خطا در افزودن کاربران',
        severity: 'error',
      });
    }
  };

  const handleRemoveUser = async (userId: number) => {
    if (!selectedGroup) return;

    if (!confirm('آیا از حذف این کاربر از گروه اطمینان دارید؟')) return;

    try {
      await removeUserMutation.mutateAsync({
        groupId: selectedGroup,
        userId,
      });
      setAlert({
        open: true,
        message: 'کاربر با موفقیت از گروه حذف شد',
        severity: 'success',
      });
      refetch();
    } catch (error: any) {
      setAlert({
        open: true,
        message: error.message || 'خطا در حذف کاربر',
        severity: 'error',
      });
    }
  };

  const handleImportUsers = async () => {
    if (!selectedGroup || !importFile) {
      setAlert({
        open: true,
        message: 'لطفاً فایل Excel را انتخاب کنید',
        severity: 'error',
      });
      return;
    }

    try {
      const result = await importUsersMutation.mutateAsync({
        groupId: selectedGroup,
        file: importFile,
      });
      
      let message = `${result.imported} کاربر با موفقیت به گروه اضافه شدند.`;
      if (result.created > 0) {
        message += ` ${result.created} کاربر جدید ایجاد شد.`;
      }
      if (result.skipped > 0) {
        message += ` ${result.skipped} کاربر رد شدند.`;
      }
      if (result.errors && result.errors.length > 0) {
        message += `\nخطاها:\n${result.errors.join('\n')}`;
      }

      setAlert({
        open: true,
        message: message,
        severity: result.errors && result.errors.length > 0 ? 'warning' : 'success',
      });
      handleCloseDialogs();
      refetch();
    } catch (error: any) {
      setAlert({
        open: true,
        message: error.message || 'خطا در import کردن فایل',
        severity: 'error',
      });
    }
  };

  const selectedGroupData = groups?.find((g: any) => g.id === selectedGroup);
  const existingUserIds = selectedGroupData?.users?.map((u: any) => u.id) || [];

  return (
    <Stack spacing={3}>
      <Breadcrumb items={[{ label: 'مدیریت گروه‌ها' }]} />

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">مدیریت گروه‌ها</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          ایجاد گروه جدید
        </Button>
      </Stack>

      {/* Groups Table */}
      <Card>
        <CardContent>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : groups && groups.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>نام گروه</TableCell>
                    <TableCell>توضیحات</TableCell>
                    <TableCell align="center">تعداد اعضا</TableCell>
                    <TableCell>ایجادکننده</TableCell>
                    <TableCell align="center">عملیات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groups.map((group: any) => (
                    <TableRow key={group.id}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <GroupIcon color="primary" />
                          <Typography fontWeight="medium">{group.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{group.description || '-'}</TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<PeopleIcon />}
                          label={group.users_count || 0}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{group.creator?.name || '-'}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenUsers(group)}
                            title="مدیریت اعضا"
                          >
                            <PeopleIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleOpenImport(group)}
                            title="Import از Excel"
                          >
                            <UploadFileIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenEdit(group)}
                            title="ویرایش"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteGroup(group.id)}
                            title="حذف"
                            disabled={deleteGroupMutation.isPending}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={4}>
              <GroupIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                هنوز گروهی ایجاد نشده است
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create Group Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>ایجاد گروه جدید</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="نام گروه *"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="توضیحات (اختیاری)"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>انصراف</Button>
          <Button
            variant="contained"
            onClick={handleCreateGroup}
            disabled={createGroupMutation.isPending || !groupName.trim()}
          >
            {createGroupMutation.isPending ? 'در حال ایجاد...' : 'ایجاد'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>ویرایش گروه</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="نام گروه *"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="توضیحات (اختیاری)"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>انصراف</Button>
          <Button
            variant="contained"
            onClick={handleUpdateGroup}
            disabled={updateGroupMutation.isPending || !groupName.trim()}
          >
            {updateGroupMutation.isPending ? 'در حال به‌روزرسانی...' : 'ذخیره'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Users Dialog */}
      <Dialog open={usersDialogOpen} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography>مدیریت اعضای گروه: {selectedGroupData?.name}</Typography>
            <IconButton size="small" onClick={handleCloseDialogs}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Add Users Section */}
            <Box>
              <Typography variant="h6" gutterBottom>
                افزودن اعضا
              </Typography>
              <TextField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو بر اساس شماره تلفن یا کد ملی..."
                fullWidth
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ mb: 2 }}
              />
              {isSearching && (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={24} />
                </Box>
              )}
              {searchResults?.data && searchResults.data.length > 0 && (
                <Paper variant="outlined">
                  <List>
                    {searchResults.data.map((user: any) => {
                      const isSelected = selectedUsers.includes(user.id);
                      const isAlreadyInGroup = existingUserIds.includes(user.id);
                      return (
                        <ListItem
                          key={user.id}
                          secondaryAction={
                            <Checkbox
                              edge="end"
                              checked={isSelected}
                              onChange={() => handleToggleUser(user.id)}
                              disabled={isAlreadyInGroup}
                            />
                          }
                          disablePadding
                        >
                          <ListItemButton
                            onClick={() => !isAlreadyInGroup && handleToggleUser(user.id)}
                            disabled={isAlreadyInGroup}
                          >
                            <ListItemText
                              primary={user.name}
                              secondary={
                                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {user.phone_number}
                                  </Typography>
                                  {user.national_id && (
                                    <>
                                      <Typography variant="caption">•</Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {user.national_id}
                                      </Typography>
                                    </>
                                  )}
                                </Stack>
                              }
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
              {searchQuery.length >= 3 && !isSearching && searchResults?.data && searchResults.data.length === 0 && (
                <Alert severity="info">نتیجه‌ای یافت نشد</Alert>
              )}
              {selectedUsers.length > 0 && (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleAddUsers}
                  disabled={addUsersMutation.isPending}
                  startIcon={addUsersMutation.isPending ? <CircularProgress size={20} /> : <AddIcon />}
                  sx={{ mt: 2 }}
                >
                  {addUsersMutation.isPending
                    ? 'در حال افزودن...'
                    : `افزودن ${selectedUsers.length} کاربر`}
                </Button>
              )}
            </Box>

            <Divider />

            {/* Current Members */}
            <Box>
              <Typography variant="h6" gutterBottom>
                اعضای فعلی ({selectedGroupData?.users_count || 0})
              </Typography>
              {selectedGroupData?.users && selectedGroupData.users.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>نام</TableCell>
                        <TableCell>شماره تماس</TableCell>
                        <TableCell>کد ملی</TableCell>
                        <TableCell align="center">عملیات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedGroupData.users.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.phone_number}</TableCell>
                          <TableCell>{user.national_id || '-'}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveUser(user.id)}
                              disabled={removeUserMutation.isPending}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">این گروه هنوز عضوی ندارد</Alert>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>بستن</Button>
        </DialogActions>
      </Dialog>

      {/* Import Users Dialog */}
      <Dialog open={importDialogOpen} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography>Import کاربران از Excel: {selectedGroupData?.name}</Typography>
            <IconButton size="small" onClick={handleCloseDialogs}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                فرمت فایل Excel:
              </Typography>
              <Typography variant="body2" component="div">
                فایل باید شامل ستون‌های زیر باشد:
                <ul style={{ marginTop: 8, marginBottom: 0, paddingRight: 20 }}>
                  <li><strong>نام</strong> (الزامی) - نام و نام خانوادگی</li>
                  <li><strong>شماره تلفن</strong> (الزامی) - شماره موبایل</li>
                  <li><strong>کد ملی</strong> (اختیاری)</li>
                  <li><strong>ایمیل</strong> (اختیاری)</li>
                </ul>
              </Typography>
            </Alert>

            <Box>
              <input
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                id="excel-file-input"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImportFile(file);
                  }
                }}
              />
              <label htmlFor="excel-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<UploadFileIcon />}
                  sx={{ py: 2 }}
                >
                  انتخاب فایل Excel
                </Button>
              </label>
              {importFile && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <DescriptionIcon color="primary" />
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {importFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(importFile.size / 1024).toFixed(2)} KB
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setImportFile(null)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              )}
            </Box>

            <Alert severity="warning">
              <Typography variant="body2">
                توجه: اگر کاربری با شماره تلفن وارد شده وجود نداشته باشد، به صورت خودکار ایجاد می‌شود.
                کاربران تکراری در گروه نادیده گرفته می‌شوند.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>انصراف</Button>
          <Button
            variant="contained"
            onClick={handleImportUsers}
            disabled={importUsersMutation.isPending || !importFile}
            startIcon={importUsersMutation.isPending ? <CircularProgress size={20} /> : <UploadFileIcon />}
          >
            {importUsersMutation.isPending ? 'در حال import...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>

      {alert.open && (
          <Toast
              open={alert.open}
              onClose={() => setAlert({ ...alert, open: false })}
              message={alert.message}
              severity={alert.severity}
          />
      )}
    </Stack>
  );
}
