"use client";

import { useState } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
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
  Paper,
  Alert,
  CircularProgress,
  Pagination,
  Tabs,
  Tab,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { partnerSchema, userSchema, PartnerFormData, UserFormData } from '@/lib/validation';
import { usePartners, useUsers, useCreatePartner, useUpdatePartner, useTogglePartnerActive, useCreateUser, useUpdateUser, useToggleUserActive } from '@/hooks';
import { Partner, User, UserRole } from '@/types';
import { useAuth } from '@/hooks';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import Breadcrumb from '@/components/Breadcrumb';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminPage() {
  const [tabValue, setTabValue] = useState(0);
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [partnerPage, setPartnerPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const { user } = useAuth();

  // Partner form
  const partnerForm = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: '',
      website_url: '',
      callback_url: '',
      is_active: true,
    },
  });

  // User form
  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      phone_number: '',
      password: '',
      role: 'creator',
    },
  });

  // Fetch partners (only when partners tab is active or on initial load)
  const { data: partnersData, isLoading: partnersLoading } = usePartners(
    tabValue === 0 ? { page: partnerPage, per_page: 15 } : undefined
  );

  // Fetch users (only when users tab is active)
  const { data: usersData, isLoading: usersLoading } = useUsers(
    tabValue === 1 ? { page: userPage, per_page: 15 } : undefined
  );

  // Partner mutations
  const createPartnerMutation = useCreatePartner();
  const updatePartnerMutation = useUpdatePartner();
  const togglePartnerActiveMutation = useTogglePartnerActive();

  // Reset page to 1 when switching tabs
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 0) {
      setPartnerPage(1);
    } else if (newValue === 1) {
      setUserPage(1);
    }
  };

  // User mutations
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const toggleUserActiveMutation = useToggleUserActive();

  const handleOpenCreatePartner = () => {
    setEditingPartner(null);
    partnerForm.reset({
      name: '',
      website_url: '',
      callback_url: '',
      is_active: true,
    });
    setPartnerOpen(true);
  };

  const handleOpenEditPartner = (partner: Partner) => {
    setEditingPartner(partner);
    partnerForm.reset({
      name: partner.name,
      website_url: partner.website_url || '',
      callback_url: partner.callback_url,
      is_active: partner.is_active,
    });
    setPartnerOpen(true);
  };

  const handleTogglePartnerActive = (partner: Partner) => {
    togglePartnerActiveMutation.mutate(partner.id);
  };

  const handleOpenCreateUser = () => {
    setEditingUser(null);
    userForm.reset({
      name: '',
      email: '',
      password: '',
      role: 'content_manager',
    });
    setUserOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    const firstRole = user.roles?.[0] || 'creator';
    userForm.reset({
      name: user.name,
      phone_number: user.phone_number,
      password: '', // Don't pre-fill password
      role: (firstRole === 'admin' || firstRole === 'content_manager' || firstRole === 'creator') 
        ? firstRole 
        : 'creator' as 'admin' | 'content_manager' | 'creator',
    });
    setUserOpen(true);
  };

  const handleToggleUserActive = (user: User) => {
    toggleUserActiveMutation.mutate(user.id);
  };

  const handleClosePartner = () => {
    setPartnerOpen(false);
    setEditingPartner(null);
    partnerForm.reset({
      name: '',
      website_url: '',
      callback_url: '',
      is_active: true,
    });
  };

  const handleCloseUser = () => {
    setUserOpen(false);
    setEditingUser(null);
    userForm.reset({
      name: '',
      email: '',
      password: '',
      role: 'content_manager',
    });
  };

  const onSubmitPartner = (data: PartnerFormData) => {
    if (editingPartner) {
      // Send name, website_url, and callback_url for updates (is_active is handled by toggle)
      updatePartnerMutation.mutate(
        { 
          id: editingPartner.id, 
          data: {
            name: data.name,
            website_url: data.website_url || null,
            callback_url: data.callback_url,
          }
        },
        {
          onSuccess: () => {
            setPartnerOpen(false);
            setEditingPartner(null);
            partnerForm.reset({
              name: '',
              website_url: '',
              callback_url: '',
              is_active: true,
            });
          },
        }
      );
    } else {
      // Send name, website_url, and callback_url for creation (is_active defaults to true on backend)
      createPartnerMutation.mutate(
        {
          name: data.name,
          website_url: data.website_url || null,
          callback_url: data.callback_url,
        },
        {
          onSuccess: () => {
            setPartnerOpen(false);
            setEditingPartner(null);
            partnerForm.reset({
              name: '',
              website_url: '',
              callback_url: '',
              is_active: true,
            });
          },
        }
      );
    }
  };

  const onSubmitUser = (data: UserFormData) => {
    if (editingUser) {
      // For updates, only send fields that are provided (password is optional)
      const updateData: { name?: string; phone_number?: string; password?: string; role?: string } = {
        name: data.name,
        phone_number: data.phone_number,
        role: data.role,
      };
      // Only include password if it's provided
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
            });
          },
        }
      );
    } else {
      // For creation, password is required
      if (!data.password || data.password.trim() === '') {
        userForm.setError('password', { message: 'رمز عبور برای کاربران جدید الزامی است' });
        return;
      }
      createUserMutation.mutate(
        {
          name: data.name,
          phone_number: data.phone_number,
          password: data.password,
          role: data.role,
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
            });
          },
        }
      );
    }
  };



  const partners = partnersData?.data || [];
  const partnersMeta = partnersData?.meta;
  const users = usersData?.data || [];
  const usersMeta = usersData?.meta;

  return (
    <UserLayout requiredRole="admin">
      <Stack spacing={3}>
        <Breadcrumb items={[{ label: 'پنل مدیریت' }]} />
        <Box>
          <Typography variant="h4">پنل مدیریت</Typography>
        </Box>

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab 
                icon={<BusinessIcon />} 
                label="شرکا" 
                iconPosition="start"
              />
              <Tab 
                icon={<PeopleIcon />} 
                label="کاربران" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">مدیریت شرکا</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreatePartner}
                >
                  افزودن شریک
                </Button>
              </Stack>

              {partnersLoading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell key="partner-name">نام</TableCell>
                        <TableCell key="partner-website">آدرس وب‌سایت</TableCell>
                        <TableCell key="partner-callback">آدرس بازگشت</TableCell>
                        <TableCell key="partner-status">وضعیت</TableCell>
                        <TableCell key="partner-created">تاریخ ایجاد</TableCell>
                        <TableCell key="partner-actions">عملیات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {partners.map((partner) => (
                        <TableRow key={partner.id}>
                          <TableCell>{partner.name}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 200, wordBreak: 'break-all' }}>
                              {partner.website_url || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 300, wordBreak: 'break-all' }}>
                              {partner.callback_url}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={partner.is_active ? 'فعال' : 'غیرفعال'} 
                              color={partner.is_active ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(partner.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEditPartner(partner)}
                                title="ویرایش شریک"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color={partner.is_active ? 'warning' : 'success'}
                                onClick={() => handleTogglePartnerActive(partner)}
                                disabled={togglePartnerActiveMutation.isPending}
                                title={partner.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                              >
                                {partner.is_active ? <ToggleOnIcon /> : <ToggleOffIcon />}
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {partnersMeta && partnersMeta.last_page > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={partnersMeta.last_page}
                    page={partnerPage}
                    onChange={(_, page) => setPartnerPage(page)}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">مدیریت کاربران</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreateUser}
                >
                  افزودن کاربر
                </Button>
              </Stack>

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
                                      role === 'admin' ? 'مدیر' :
                                      role === 'content_manager' ? 'مدیر محتوا' :
                                      role === 'creator' ? 'سازنده' : role
                              } 
                              color={
                                      role === 'admin' ? 'error' :
                                      role === 'content_manager' ? 'primary' :
                                      role === 'creator' ? 'success' : 'default'
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
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEditUser(user)}
                                title="ویرایش کاربر"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color={user.is_active ? 'warning' : 'success'}
                                onClick={() => handleToggleUserActive(user)}
                                disabled={toggleUserActiveMutation.isPending}
                                title={user.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
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
          </TabPanel>
        </Card>

        {/* Partner Dialog */}
        <Dialog open={partnerOpen} onClose={handleClosePartner} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingPartner ? 'ویرایش شریک' : 'ایجاد شریک جدید'}
          </DialogTitle>
          <DialogContent>
            <form onSubmit={partnerForm.handleSubmit(onSubmitPartner)}>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Controller
                  name="name"
                  control={partnerForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="نام شریک"
                      fullWidth
                      error={!!partnerForm.formState.errors.name}
                      helperText={partnerForm.formState.errors.name?.message}
                    />
                  )}
                />

                <Controller
                  name="website_url"
                  control={partnerForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="آدرس وب‌سایت"
                      fullWidth
                      placeholder="https://example.com"
                      error={!!partnerForm.formState.errors.website_url}
                      helperText={partnerForm.formState.errors.website_url?.message}
                    />
                  )}
                />

                <Controller
                  name="callback_url"
                  control={partnerForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="آدرس بازگشت"
                      fullWidth
                      error={!!partnerForm.formState.errors.callback_url}
                      helperText={partnerForm.formState.errors.callback_url?.message}
                    />
                  )}
                />

              </Stack>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePartner}>لغو</Button>
            <Button 
              onClick={partnerForm.handleSubmit(onSubmitPartner)} 
              variant="contained"
              disabled={createPartnerMutation.isPending || updatePartnerMutation.isPending}
            >
              {createPartnerMutation.isPending || updatePartnerMutation.isPending 
                ? 'در حال ذخیره...' 
                : editingPartner ? 'به‌روزرسانی' : 'ایجاد'
              }
            </Button>
          </DialogActions>
        </Dialog>

        {/* User Dialog */}
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
                      helperText={userForm.formState.errors.phone_number?.message || 'فرمت: 09123456789 یا +989123456789'}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={userForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={editingUser ? 'رمز عبور جدید (خالی بگذارید تا تغییر نکند)' : 'رمز عبور'}
                      fullWidth
                      type="password"
                      error={!!userForm.formState.errors.password}
                      helperText={userForm.formState.errors.password?.message}
                      required={!editingUser}
                    />
                  )}
                />

                <Controller
                  name="role"
                  control={userForm.control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>نقش</InputLabel>
                      <Select {...field} label="نقش">
                        <MenuItem value="admin">مدیر</MenuItem>
                        <MenuItem value="content_manager">مدیر محتوا</MenuItem>
                        <MenuItem value="partner_user">کاربر شریک</MenuItem>
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
                : editingUser ? 'به‌روزرسانی' : 'ایجاد'
              }
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </UserLayout>
  );
}
