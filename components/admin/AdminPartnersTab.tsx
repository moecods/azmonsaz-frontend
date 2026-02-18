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
  IconButton,
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
  CircularProgress,
  Pagination,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { partnerSchema, PartnerFormData } from '@/lib/validation';
import { usePartners, useCreatePartner, useUpdatePartner, useTogglePartnerActive } from '@/hooks';
import { Partner } from '@/types';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';

interface AdminPartnersTabProps {
  isActive: boolean;
}

export function AdminPartnersTab({ isActive }: AdminPartnersTabProps) {
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [partnerPage, setPartnerPage] = useState(1);

  const partnerForm = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: '',
      website_url: '',
      callback_url: '',
      is_active: true,
    },
  });

  const { data: partnersData, isLoading: partnersLoading, isError: partnersError, error: partnersErrorDetail } = usePartners(
    isActive ? { page: partnerPage, per_page: 15 } : undefined
  );

  const createPartnerMutation = useCreatePartner();
  const updatePartnerMutation = useUpdatePartner();
  const togglePartnerActiveMutation = useTogglePartnerActive();

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

  const partners = partnersData?.data || [];
  const partnersMeta = partnersData?.meta;

  return (
    <>
      <Stack spacing={3}>
        {partnersError && (
          <Alert severity="error">
            {partnersErrorDetail instanceof Error ? partnersErrorDetail.message : 'خطا در بارگذاری لیست شرکا'}
          </Alert>
        )}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">مدیریت شرکا</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreatePartner}
            data-cy="admin-add-partner"
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
                      {new Date(partner.created_at).toLocaleDateString('fa-IR', {
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
                          onClick={() => handleOpenEditPartner(partner)}
                          title="ویرایش شریک"
                          aria-label="ویرایش شریک"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color={partner.is_active ? 'warning' : 'success'}
                          onClick={() => handleTogglePartnerActive(partner)}
                          disabled={togglePartnerActiveMutation.isPending}
                          title={partner.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                          aria-label={partner.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
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
              : editingPartner
                ? 'به‌روزرسانی'
                : 'ایجاد'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
