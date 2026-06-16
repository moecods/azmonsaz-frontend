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
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { partnerSchema, PartnerFormData } from '@/lib/validation';
import { usePartners, useCreatePartner, useUpdatePartner, useTogglePartnerActive } from '@/hooks';
import { Partner } from '@/types';
import {
  AdminEmptyState,
  AdminFilterPanel,
  AdminSectionHeader,
  AdminTableShell,
  adminTableHeadSx,
  adminTableRowSx,
} from '@/components/admin/admin-shared';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import LinkIcon from '@mui/icons-material/Link';

type StatusFilter = '' | '1' | '0';

const EMPTY_FILTERS = {
  search: '',
  is_active: '' as StatusFilter,
};

function formatCreatedDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fa-IR', {
    calendar: 'persian',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function AdminPartnersTab() {
  const theme = useTheme();
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [partnerPage, setPartnerPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const partnerForm = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: '',
      website_url: '',
      callback_url: '',
      is_active: true,
    },
  });

  const apiFilters = useMemo(
    () => ({
      page: partnerPage,
      per_page: 15,
      search: filters.search.trim() || undefined,
      is_active: filters.is_active || undefined,
    }),
    [partnerPage, filters]
  );

  const hasActiveFilters = Boolean(filters.search.trim() || filters.is_active);

  const { data: partnersData, isLoading: partnersLoading, isError: partnersError, error: partnersErrorDetail } =
    usePartners(apiFilters);

  const createPartnerMutation = useCreatePartner();
  const updatePartnerMutation = useUpdatePartner();
  const togglePartnerActiveMutation = useTogglePartnerActive();

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPartnerPage(1);
  };

  const updateFilter = <K extends keyof typeof EMPTY_FILTERS>(key: K, value: (typeof EMPTY_FILTERS)[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPartnerPage(1);
  };

  const handleOpenCreatePartner = () => {
    setEditingPartner(null);
    partnerForm.reset({ name: '', website_url: '', callback_url: '', is_active: true });
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

  const handleClosePartner = () => {
    setPartnerOpen(false);
    setEditingPartner(null);
    partnerForm.reset({ name: '', website_url: '', callback_url: '', is_active: true });
  };

  const onSubmitPartner = (data: PartnerFormData) => {
    if (editingPartner) {
      updatePartnerMutation.mutate(
        {
          id: editingPartner.id,
          data: {
            name: data.name,
            website_url: data.website_url || null,
            callback_url: data.callback_url,
          },
        },
        { onSuccess: handleClosePartner }
      );
    } else {
      createPartnerMutation.mutate(
        {
          name: data.name,
          website_url: data.website_url || null,
          callback_url: data.callback_url,
        },
        { onSuccess: handleClosePartner }
      );
    }
  };

  const partners = partnersData?.data || [];
  const partnersMeta = partnersData?.meta;

  return (
    <>
      <Stack spacing={2.5}>
        {partnersError && (
          <Alert severity="error">
            {partnersErrorDetail instanceof Error ? partnersErrorDetail.message : 'خطا در بارگذاری لیست شرکا'}
          </Alert>
        )}

        <AdminSectionHeader
          icon={<BusinessIcon fontSize="small" />}
          title="مدیریت شرکا"
          subtitle="تنظیم callback و وضعیت یکپارچه‌سازی"
          count={partnersMeta?.total}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreatePartner}
              data-cy="admin-add-partner"
            >
              افزودن شریک
            </Button>
          }
        />

        <AdminFilterPanel onReset={resetFilters} showReset={hasActiveFilters}>
          <TextField
            size="small"
            placeholder="جستجو نام، وب‌سایت، callback…"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: '100%', md: 280 }, flex: { md: '1 1 280px' } }}
          />
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
        </AdminFilterPanel>

        {partnersLoading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : partners.length === 0 ? (
          <AdminEmptyState
            icon={<BusinessIcon />}
            title="شریکی یافت نشد"
            description={
              hasActiveFilters
                ? 'فیلترها را تغییر دهید یا شریک جدید اضافه کنید.'
                : 'هنوز شریکی ثبت نشده است.'
            }
          />
        ) : (
          <AdminTableShell>
            <Table>
              <TableHead>
                <TableRow sx={adminTableHeadSx(theme)}>
                  <TableCell>نام</TableCell>
                  <TableCell>آدرس وب‌سایت</TableCell>
                  <TableCell>آدرس بازگشت</TableCell>
                  <TableCell align="center">وضعیت</TableCell>
                  <TableCell>تاریخ ایجاد</TableCell>
                  <TableCell align="center">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {partners.map((partner, index) => (
                  <TableRow key={partner.id} hover sx={adminTableRowSx(theme, index)}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            bgcolor: 'action.hover',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'primary.main',
                          }}
                        >
                          <BusinessIcon fontSize="small" />
                        </Box>
                        <Typography variant="body2" fontWeight={700}>
                          {partner.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 220, wordBreak: 'break-all' }}>
                        {partner.website_url || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ maxWidth: 280 }}>
                        <LinkIcon fontSize="inherit" color="action" />
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                          {partner.callback_url}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={partner.is_active ? 'فعال' : 'غیرفعال'}
                        color={partner.is_active ? 'success' : 'default'}
                        size="small"
                        variant={partner.is_active ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatCreatedDate(partner.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.25} justifyContent="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditPartner(partner)}
                          title="ویرایش شریک"
                          aria-label="ویرایش شریک"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color={partner.is_active ? 'warning' : 'success'}
                          onClick={() => togglePartnerActiveMutation.mutate(partner.id)}
                          disabled={togglePartnerActiveMutation.isPending}
                          title={partner.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                          aria-label={partner.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                        >
                          {partner.is_active ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AdminTableShell>
        )}

        {partnersMeta && partnersMeta.last_page > 1 && (
          <Box display="flex" justifyContent="center">
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

      <Dialog open={partnerOpen} onClose={handleClosePartner} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingPartner ? 'ویرایش شریک' : 'ایجاد شریک جدید'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={partnerForm.handleSubmit(onSubmitPartner)}>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
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
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClosePartner}>لغو</Button>
          <Button
            onClick={partnerForm.handleSubmit(onSubmitPartner)}
            variant="contained"
            disabled={createPartnerMutation.isPending || updatePartnerMutation.isPending}
          >
            {createPartnerMutation.isPending || updatePartnerMutation.isPending
              ? 'در حال ذخیره...'
              : editingPartner
                ? 'به‌روزرسانی'
                : 'ایجاد'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
