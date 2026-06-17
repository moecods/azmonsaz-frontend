"use client";

import { useMemo, useState } from 'react';
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
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Pagination,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, UserFormData } from '@/lib/validation';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useToggleUserActive,
  useImpersonateUser,
  useToast,
  useReducedMotion,
} from '@/hooks';
import { LoadingButton } from '@/components/feedback/LoadingButton';
import { useConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { AnimatedListBody } from '@/components/feedback/AnimatedListBody';
import { dialogTransitionProps, pressableSx } from '@/theme/motion';
import { User } from '@/types';
import UserAvatar from '@/components/ui/UserAvatar';
import {
  ADMIN_ASSIGNABLE_ROLES,
  ADMIN_ROLE_LABELS,
  filterAssignableRoles,
  getAdminRoleChipColor,
  getAdminRoleLabel,
} from '@/components/admin/admin-roles';
import {
  AdminEmptyState,
  AdminFilterPanel,
  AdminSectionHeader,
  AdminTableShell,
  AdminTableSkeleton,
  adminTableHeadSx,
  adminTableRowSx,
} from '@/components/admin/admin-shared';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import LoginIcon from '@mui/icons-material/Login';
import SearchIcon from '@mui/icons-material/Search';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';

type StatusFilter = '' | '1' | '0';
type ProFilter = '' | '1' | '0';
type RoleFilter = '' | 'admin' | 'content_manager' | 'creator' | 'none';

const EMPTY_FILTERS = {
  search: '',
  role: '' as RoleFilter,
  is_active: '' as StatusFilter,
  has_pro: '' as ProFilter,
};

function formatCreatedDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fa-IR', {
    calendar: 'persian',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatSubscriptionLabel(endsAt: string): string {
  return new Date(endsAt).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function UserIdentityCell({ user }: { user: User }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
      <UserAvatar
        name={user.name}
        avatarUrl={user.avatar_url}
        sx={{ width: 44, height: 44, fontSize: '0.9rem', flexShrink: 0 }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} noWrap title={user.name}>
          {user.name}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          dir="ltr"
          sx={{ display: 'block', textAlign: 'right' }}
        >
          {user.phone_number}
        </Typography>
        {user.email ? (
          <Typography variant="caption" color="text.disabled" noWrap sx={{ display: 'block' }}>
            {user.email}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
}

function UserRolesCell({ roles }: { roles: string[] }) {
  if (!roles.length) {
    return (
      <Typography variant="body2" color="text.disabled">
        بدون نقش
      </Typography>
    );
  }

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {roles.map((role) => (
        <Chip
          key={role}
          label={getAdminRoleLabel(role)}
          color={getAdminRoleChipColor(role)}
          size="small"
          variant="outlined"
        />
      ))}
    </Stack>
  );
}

function SubscriptionCell({ user }: { user: User }) {
  const endsAt = user.subscription?.ends_at;
  if (!endsAt) {
    return <Chip label="ندارد" size="small" color="default" variant="outlined" />;
  }

  const active = new Date(endsAt) > new Date();
  if (active) {
    return (
      <Chip
        label={`فعال تا ${formatSubscriptionLabel(endsAt)}`}
        color="success"
        size="small"
        variant="outlined"
      />
    );
  }

  return <Chip label="منقضی" color="default" size="small" />;
}

export function AdminUsersTab() {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const toast = useToast();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();
  const [userOpen, setUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userPage, setUserPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

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

  const apiFilters = useMemo(
    () => ({
      page: userPage,
      per_page: 15,
      search: filters.search.trim() || undefined,
      role: filters.role || undefined,
      is_active: filters.is_active || undefined,
      has_pro: filters.has_pro || undefined,
    }),
    [userPage, filters]
  );

  const hasActiveFilters = Boolean(
    filters.search.trim() || filters.role || filters.is_active || filters.has_pro
  );

  const { data: usersData, isLoading: usersLoading, isError: usersError, error: usersErrorDetail } =
    useUsers(apiFilters);

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const toggleUserActiveMutation = useToggleUserActive();
  const impersonateUserMutation = useImpersonateUser();

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setUserPage(1);
  };

  const updateFilter = <K extends keyof typeof EMPTY_FILTERS>(key: K, value: (typeof EMPTY_FILTERS)[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setUserPage(1);
  };

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
    const roles = filterAssignableRoles(user.roles);
    userForm.reset({
      name: user.name,
      phone_number: user.phone_number,
      password: '',
      role: roles[0],
      roles,
    });
    setUserOpen(true);
  };

  const handleToggleUserActive = (user: User) => {
    toggleUserActiveMutation.mutate(user.id, {
      onSuccess: (data) => {
        toast.success(data.is_active ? 'کاربر فعال شد' : 'کاربر غیرفعال شد');
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'خطا در تغییر وضعیت');
      },
    });
  };

  const handleImpersonateUser = async (user: User) => {
    const ok = await confirm({
      title: 'ورود به اکانت کاربر',
      message: `آیا می‌خواهید با اکانت ${user.name} وارد شوید؟`,
      confirmLabel: 'ورود',
      confirmColor: 'primary',
    });
    if (!ok) return;
    impersonateUserMutation.mutate(user.id, {
      onError: (error: unknown) => {
        toast.error(error instanceof Error ? error.message : 'خطا در ورود به اکانت کاربر');
      },
    });
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
            toast.success('کاربر به‌روزرسانی شد');
            handleCloseUser();
          },
          onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'خطا در به‌روزرسانی');
          },
        }
      );
    } else {
      if (!data.password || data.password.trim() === '') {
        userForm.setError('password', { message: 'رمز عبور برای کاربران جدید الزامی است' });
        return;
      }
      createUserMutation.mutate(
        {
          name: data.name,
          phone_number: data.phone_number,
          password: data.password,
          roles: (data.roles ?? []) as string[],
        },
        {
          onSuccess: () => {
            toast.success('کاربر ایجاد شد');
            handleCloseUser();
          },
          onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'خطا در ایجاد کاربر');
          },
        }
      );
    }
  };

  const users = usersData?.data || [];
  const usersMeta = usersData?.meta;

  return (
    <>
      <Stack spacing={2.5}>
        {usersError && (
          <Alert severity="error">
            {usersErrorDetail instanceof Error ? usersErrorDetail.message : 'خطا در بارگذاری لیست کاربران'}
          </Alert>
        )}

        <AdminSectionHeader
          icon={<PeopleOutlineIcon fontSize="small" />}
          title="مدیریت کاربران"
          subtitle="جستجو، فیلتر و ویرایش نقش"
          count={usersMeta?.total}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateUser}
              data-cy="admin-add-user"
            >
              افزودن کاربر
            </Button>
          }
        />

        <AdminFilterPanel onReset={resetFilters} showReset={hasActiveFilters}>
          <TextField
            size="small"
            placeholder="جستجو نام، موبایل، ایمیل…"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: '100%', md: 260 }, flex: { md: '1 1 260px' } }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>نقش</InputLabel>
            <Select
              label="نقش"
              value={filters.role}
              onChange={(e) => updateFilter('role', e.target.value as RoleFilter)}
            >
              <MenuItem value="">همه</MenuItem>
              <MenuItem value="none">بدون نقش</MenuItem>
              {ADMIN_ASSIGNABLE_ROLES.map((role) => (
                <MenuItem key={role} value={role}>
                  {ADMIN_ROLE_LABELS[role]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>وضعیت</InputLabel>
            <Select
              label="وضعیت"
              value={filters.is_active}
              onChange={(e) => updateFilter('is_active', e.target.value as StatusFilter)}
            >
              <MenuItem value="">همه</MenuItem>
              <MenuItem value="1">فعال</MenuItem>
              <MenuItem value="0">غیرفعال</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>اشتراک Pro</InputLabel>
            <Select
              label="اشتراک Pro"
              value={filters.has_pro}
              onChange={(e) => updateFilter('has_pro', e.target.value as ProFilter)}
            >
              <MenuItem value="">همه</MenuItem>
              <MenuItem value="1">دارای Pro</MenuItem>
              <MenuItem value="0">بدون Pro</MenuItem>
            </Select>
          </FormControl>
        </AdminFilterPanel>

        {usersLoading ? (
          <AdminTableSkeleton rows={6} />
        ) : users.length === 0 ? (
          <AdminEmptyState
            icon={<PeopleOutlineIcon />}
            title="کاربری یافت نشد"
            description={
              hasActiveFilters
                ? 'فیلترها را تغییر دهید یا کاربر جدید اضافه کنید.'
                : 'هنوز کاربری ثبت نشده است.'
            }
          />
        ) : (
          <AdminTableShell>
            <Table size="medium">
              <TableHead>
                <TableRow sx={adminTableHeadSx(theme)}>
                  <TableCell sx={{ minWidth: 240 }}>کاربر</TableCell>
                  <TableCell sx={{ minWidth: 160 }}>نقش</TableCell>
                  <TableCell align="center" sx={{ width: 100 }}>وضعیت</TableCell>
                  <TableCell sx={{ minWidth: 140 }}>اشتراک Pro</TableCell>
                  <TableCell sx={{ width: 120 }}>تاریخ ایجاد</TableCell>
                  <TableCell align="center" sx={{ width: 132 }}>عملیات</TableCell>
                </TableRow>
              </TableHead>
              <AnimatedListBody animationKey={`${userPage}-${filters.search}-${filters.role}`}>
                {users.map((user, index) => (
                  <TableRow key={user.id} hover sx={adminTableRowSx(theme, index, reducedMotion)}>
                    <TableCell sx={{ py: 1.75 }}>
                      <UserIdentityCell user={user} />
                    </TableCell>
                    <TableCell>
                      <UserRolesCell roles={user.roles ?? []} />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={user.is_active ? 'فعال' : 'غیرفعال'}
                        color={user.is_active ? 'success' : 'default'}
                        size="small"
                        variant={user.is_active ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <SubscriptionCell user={user} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatCreatedDate(user.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.25} justifyContent="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditUser(user)}
                          title="ویرایش کاربر"
                          aria-label="ویرایش کاربر"
                          sx={pressableSx(reducedMotion)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleImpersonateUser(user)}
                          disabled={impersonateUserMutation.isPending}
                          title="ورود به اکانت کاربر"
                          aria-label="ورود به اکانت کاربر"
                        >
                          <LoginIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color={user.is_active ? 'success' : 'warning'}
                          onClick={() => handleToggleUserActive(user)}
                          disabled={toggleUserActiveMutation.isPending}
                          title={user.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                          aria-label={user.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                        >
                          {user.is_active ? (
                            <ToggleOnIcon fontSize="small" />
                          ) : (
                            <ToggleOffIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </AnimatedListBody>
            </Table>
          </AdminTableShell>
        )}

        {usersMeta && usersMeta.last_page > 1 && (
          <Box display="flex" justifyContent="center">
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

      <Dialog
        open={userOpen}
        onClose={handleCloseUser}
        maxWidth="sm"
        fullWidth
        TransitionProps={dialogTransitionProps(reducedMotion)}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingUser ? 'ویرایش کاربر' : 'ایجاد کاربر جدید'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={userForm.handleSubmit(onSubmitUser)}>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              {editingUser ? (
                <Stack direction="row" spacing={2} alignItems="center" sx={{ pb: 0.5 }}>
                  <UserAvatar
                    name={editingUser.name}
                    avatarUrl={editingUser.avatar_url}
                    sx={{ width: 56, height: 56, fontSize: '1rem' }}
                  />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {editingUser.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" dir="ltr" sx={{ display: 'block', textAlign: 'right' }}>
                      {editingUser.phone_number}
                    </Typography>
                  </Box>
                </Stack>
              ) : null}
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
                    <InputLabel id="admin-user-roles-label">نقش‌ها</InputLabel>
                    <Select
                      {...field}
                      labelId="admin-user-roles-label"
                      multiple
                      displayEmpty
                      label="نقش‌ها"
                      value={field.value ?? []}
                      renderValue={(selected) => {
                        const items = selected as string[];
                        if (items.length === 0) {
                          return (
                            <Typography component="span" variant="body2" color="text.secondary">
                              {'\u00A0'}
                            </Typography>
                          );
                        }
                        return items.map(getAdminRoleLabel).join('، ');
                      }}
                    >
                      {ADMIN_ASSIGNABLE_ROLES.map((role) => (
                        <MenuItem key={role} value={role}>
                          {ADMIN_ROLE_LABELS[role]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Stack>
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseUser}>لغو</Button>
          <LoadingButton
            onClick={userForm.handleSubmit(onSubmitUser)}
            variant="contained"
            loading={createUserMutation.isPending || updateUserMutation.isPending}
            loadingText="در حال ذخیره..."
            successFlash={editingUser ? 'به‌روز شد' : 'ایجاد شد'}
          >
            {editingUser ? 'به‌روزرسانی' : 'ایجاد'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
      {confirmDialog}
    </>
  );
}
