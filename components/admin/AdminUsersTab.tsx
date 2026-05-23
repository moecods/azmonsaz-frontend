"use client";

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, UserFormData } from '@/lib/validation';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useToggleUserActive,
  useImpersonateUser,
} from '@/hooks';
import { User } from '@/types';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import LoginIcon from '@mui/icons-material/Login';

interface AdminUsersTabProps {
  isActive: boolean;
}

export function AdminUsersTab({ isActive }: AdminUsersTabProps) {
  const [userOpen, setUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');

  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      phone_number: '',
      password: '',
      role: 'creator',
      roles: ['content_manager'],
    },
  });

  const { data: usersData, isLoading: usersLoading, isError: usersError, error: usersErrorDetail } = useUsers(
    isActive ? { page: userPage, per_page: 15, search: userSearch || undefined } : undefined
  );

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const toggleUserActiveMutation = useToggleUserActive();
  const impersonateUserMutation = useImpersonateUser();

  const handleOpenCreateUser = () => {
    setEditingUser(null);
    userForm.reset({
      name: '',
      phone_number: '',
      password: '',
      role: 'content_manager',
      roles: ['content_manager'],
    });
    setUserOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    const validRoles = ['admin', 'content_manager', 'creator'] as const;
    const filtered = user.roles?.filter((r): r is typeof validRoles[number] =>
      validRoles.includes(r as typeof validRoles[number])
    ) ?? [];
    const roles = filtered.length ? filtered : ['creator'];
    userForm.reset({
      name: user.name,
      phone_number: user.phone_number,
      password: '',
      role: roles[0] ?? 'creator',
      roles,
    });
    setUserOpen(true);
  };

  const handleToggleUserActive = (user: User) => {
    toggleUserActiveMutation.mutate(user.id);
  };

  const handleImpersonateUser = (user: User) => {
    if (window.confirm(`آیا می‌خواهید با اکانت ${user.name} وارد شوید؟`)) {
      impersonateUserMutation.mutate(user.id, {
        onSuccess: () => {
          window.location.href = '/dashboard';
        },
        onError: (error: unknown) => {
          const err = error as { message?: string };
          alert(err.message || 'خطا در ورود به اکانت کاربر');
        },
      });
    }
  };

  const handleCloseUser = () => {
    setUserOpen(false);
    setEditingUser(null);
    userForm.reset({
      name: '',
      phone_number: '',
      password: '',
      role: 'content_manager',
      roles: ['content_manager'],
    });
  };

  const onSubmitUser = (data: UserFormData) => {
    if (editingUser) {
      const roles = (data.roles ?? []) as string[];
      const updateData: {
        name?: string;
        phone_number?: string;
        password?: string;
        roles?: string[];
      } = {
        name: data.name,
        phone_number: data.phone_number,
        roles,
      };
      if (data.password && data.password.trim() !== '') {
        updateData.password = data.password;
      }
      updateUserMutation.mutate(
        { id: editingUser.id, data: updateData },
        {
          onSuccess: () => {
            setUserOpen(false);
            setEditingUser(null);
            userForm.reset({
              name: '',
              phone_number: '',
              password: '',
              role: 'content_manager',
              roles: ['content_manager'],
            });
          },
        }
      );
    } else {
      if (!data.password || data.password.trim() === '') {
        userForm.setError('password', { message: 'رمز عبور برای کاربران جدید الزامی است' });
        return;
      }
      const createRoles = (data.roles ?? []) as string[];
      createUserMutation.mutate(
        {
          name: data.name,
          phone_number: data.phone_number,
          password: data.password,
          roles: createRoles,
        },
        {
          onSuccess: () => {
            setUserOpen(false);
            setEditingUser(null);
            userForm.reset({
              name: '',
              phone_number: '',
              password: '',
              role: 'content_manager',
              roles: ['content_manager'],
            });
          },
        }
      );
    }
  };

  const users = usersData?.data || [];
  const usersMeta = usersData?.meta;

  return (
    <>
      <Stack spacing={3}>
        {usersError && (
          <Alert severity="error">
            {usersErrorDetail instanceof Error ? usersErrorDetail.message : 'خطا در بارگذاری لیست کاربران'}
          </Alert>
        )}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">مدیریت کاربران</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateUser}
            data-cy="admin-add-user"
          >
            افزودن کاربر
          </Button>
        </Stack>

        <TextField
          size="small"
          placeholder="جستجو نام، موبایل، ایمیل…"
          value={userSearch}
          onChange={(e) => {
            setUserSearch(e.target.value);
            setUserPage(1);
          }}
          sx={{ maxWidth: 360 }}
        />

        {usersLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell key="user-name">نام</TableCell>
                  <TableCell key="user-phone">شماره تلفن</TableCell>
                  <TableCell key="user-role">نقش</TableCell>
                  <TableCell key="user-status">وضعیت</TableCell>
                  <TableCell key="user-subscription">اشتراک Pro</TableCell>
                  <TableCell key="user-created">تاریخ ایجاد</TableCell>
                  <TableCell key="user-actions">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.phone_number}</TableCell>
                    <TableCell>
                      {user.roles && user.roles.length > 0 ? (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {user.roles.map((role) => (
                            <Chip
                              key={role}
                              label={
                                role === 'admin'
                                  ? 'مدیر'
                                  : role === 'content_manager'
                                    ? 'مدیر محتوا'
                                    : role === 'creator'
                                      ? 'سازنده'
                                      : role
                              }
                              color={
                                role === 'admin'
                                  ? 'error'
                                  : role === 'content_manager'
                                    ? 'primary'
                                    : role === 'creator'
                                      ? 'success'
                                      : 'default'
                              }
                              size="small"
                            />
                          ))}
                        </Stack>
                      ) : (
                        <Chip label="بدون نقش" size="small" color="default" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? 'فعال' : 'غیرفعال'}
                        color={user.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.subscription?.ends_at ? (
                        new Date(user.subscription.ends_at) > new Date() ? (
                          <Chip
                            label={`فعال تا ${new Date(user.subscription.ends_at).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' })}`}
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip label="منقضی" color="default" size="small" />
                        )
                      ) : (
                        <Chip label="ندارد" color="default" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('fa-IR', {
                        calendar: 'persian',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditUser(user)}
                          title="ویرایش کاربر"
                          aria-label="ویرایش کاربر"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleImpersonateUser(user)}
                          disabled={impersonateUserMutation.isPending}
                          title="ورود به اکانت کاربر"
                          aria-label="ورود به اکانت کاربر"
                        >
                          <LoginIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color={user.is_active ? 'success' : 'warning'}
                          onClick={() => handleToggleUserActive(user)}
                          disabled={toggleUserActiveMutation.isPending}
                          title={user.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                          aria-label={user.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                        >
                          {user.is_active ? <ToggleOnIcon /> : <ToggleOffIcon />}
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {usersMeta && usersMeta.last_page > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={usersMeta.last_page}
              page={userPage}
              onChange={(_, page) => setUserPage(page)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Stack>

      <Dialog open={userOpen} onClose={handleCloseUser} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'ویرایش کاربر' : 'ایجاد کاربر جدید'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={userForm.handleSubmit(onSubmitUser)}>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Controller
                name="name"
                control={userForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="نام کامل"
                    fullWidth
                    error={!!userForm.formState.errors.name}
                    helperText={userForm.formState.errors.name?.message}
                  />
                )}
              />
              <Controller
                name="phone_number"
                control={userForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="شماره تلفن"
                    fullWidth
                    type="tel"
                    placeholder="09123456789"
                    error={!!userForm.formState.errors.phone_number}
                    helperText={
                      userForm.formState.errors.phone_number?.message ||
                      'فرمت: 09123456789 یا +989123456789'
                    }
                  />
                )}
              />
              <Controller
                name="password"
                control={userForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={
                      editingUser
                        ? 'رمز عبور جدید (خالی بگذارید تا تغییر نکند)'
                        : 'رمز عبور'
                    }
                    fullWidth
                    type="password"
                    error={!!userForm.formState.errors.password}
                    helperText={userForm.formState.errors.password?.message}
                    required={!editingUser}
                  />
                )}
              />
              <Controller
                name="roles"
                control={userForm.control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>نقش‌ها</InputLabel>
                    <Select
                      {...field}
                      multiple
                      label="نقش‌ها"
                      renderValue={(selected) =>
                        (selected as string[])
                          .map(
                            (r) =>
                              ({
                                admin: 'مدیر',
                                content_manager: 'مدیر محتوا',
                                creator: 'سازنده',
                              } as Record<string, string>)[r] ?? r
                          )
                          .join('، ')
                      }
                    >
                      <MenuItem value="admin">مدیر</MenuItem>
                      <MenuItem value="content_manager">مدیر محتوا</MenuItem>
                      <MenuItem value="creator">سازنده</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Stack>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUser}>لغو</Button>
          <Button
            onClick={userForm.handleSubmit(onSubmitUser)}
            variant="contained"
            disabled={createUserMutation.isPending || updateUserMutation.isPending}
          >
            {createUserMutation.isPending || updateUserMutation.isPending
              ? 'در حال ذخیره...'
              : editingUser
                ? 'به‌روزرسانی'
                : 'ایجاد'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
