"use client";

import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { questionCategorySchema, QuestionCategoryFormData } from '@/lib/validation';
import {
  useQuestionCategories,
  useCreateQuestionCategory,
  useUpdateQuestionCategory,
  useDeleteQuestionCategory,
} from '@/hooks';
import { QuestionCategory } from '@/types';
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
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';

function formatCreatedDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fa-IR', {
    calendar: 'persian',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function AdminQuestionCategoriesTab() {
  const theme = useTheme();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<QuestionCategory | null>(null);
  const [search, setSearch] = useState('');

  const categoryForm = useForm<QuestionCategoryFormData>({
    resolver: zodResolver(questionCategorySchema),
    defaultValues: { name: '', description: '' },
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesErrorDetail,
  } = useQuestionCategories(true);

  const createCategoryMutation = useCreateQuestionCategory();
  const updateCategoryMutation = useUpdateQuestionCategory();
  const deleteCategoryMutation = useDeleteQuestionCategory();

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q)
    );
  }, [categories, search]);

  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    categoryForm.reset({ name: '', description: '' });
    setCategoryOpen(true);
  };

  const handleOpenEditCategory = (category: QuestionCategory) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      description: category.description || '',
    });
    setCategoryOpen(true);
  };

  const handleDeleteCategory = (category: QuestionCategory) => {
    if (window.confirm(`آیا از حذف دسته‌بندی «${category.name}» اطمینان دارید؟`)) {
      deleteCategoryMutation.mutate(category.id);
    }
  };

  const handleCloseCategory = () => {
    setCategoryOpen(false);
    setEditingCategory(null);
    categoryForm.reset({ name: '', description: '' });
  };

  const onSubmitCategory = (data: QuestionCategoryFormData) => {
    if (editingCategory) {
      updateCategoryMutation.mutate(
        {
          id: editingCategory.id,
          data: { name: data.name, description: data.description || undefined },
        },
        { onSuccess: handleCloseCategory }
      );
    } else {
      createCategoryMutation.mutate(
        { name: data.name, description: data.description || undefined },
        { onSuccess: handleCloseCategory }
      );
    }
  };

  return (
    <>
      <Stack spacing={2.5}>
        {categoriesError && (
          <Alert severity="error">
            {categoriesErrorDetail instanceof Error
              ? categoriesErrorDetail.message
              : 'خطا در بارگذاری لیست دسته‌بندی‌ها'}
          </Alert>
        )}

        <AdminSectionHeader
          icon={<CategoryIcon fontSize="small" />}
          title="مدیریت دسته‌بندی سوالات"
          subtitle="طبقه‌بندی بانک سوال"
          count={categories.length}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateCategory}
              data-cy="admin-add-question-category"
            >
              افزودن دسته‌بندی
            </Button>
          }
        />

        <AdminFilterPanel showReset={Boolean(search.trim())} onReset={() => setSearch('')}>
          <TextField
            size="small"
            placeholder="جستجو نام یا توضیحات…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: '100%', md: 320 } }}
          />
        </AdminFilterPanel>

        {categoriesLoading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : filteredCategories.length === 0 ? (
          <AdminEmptyState
            icon={<CategoryIcon />}
            title="دسته‌بندی‌ای یافت نشد"
            description={
              search.trim()
                ? 'عبارت جستجو را تغییر دهید یا دسته‌بندی جدید اضافه کنید.'
                : 'هنوز دسته‌بندی‌ای ایجاد نشده است.'
            }
          />
        ) : (
          <AdminTableShell>
            <Table>
              <TableHead>
                <TableRow sx={adminTableHeadSx(theme)}>
                  <TableCell>نام</TableCell>
                  <TableCell>توضیحات</TableCell>
                  <TableCell>تاریخ ایجاد</TableCell>
                  <TableCell align="center">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCategories.map((category, index) => (
                  <TableRow key={category.id} hover sx={adminTableRowSx(theme, index)}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CategoryIcon fontSize="small" color="primary" />
                        <Typography variant="body2" fontWeight={700}>
                          {category.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
                        {category.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatCreatedDate(category.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.25} justifyContent="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditCategory(category)}
                          title="ویرایش دسته‌بندی"
                          aria-label="ویرایش دسته‌بندی"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteCategory(category)}
                          disabled={deleteCategoryMutation.isPending}
                          title="حذف دسته‌بندی"
                          aria-label="حذف دسته‌بندی"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AdminTableShell>
        )}
      </Stack>

      <Dialog open={categoryOpen} onClose={handleCloseCategory} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingCategory ? 'ویرایش دسته‌بندی' : 'ایجاد دسته‌بندی جدید'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)}>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Controller
                name="name"
                control={categoryForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="نام دسته‌بندی"
                    fullWidth
                    error={!!categoryForm.formState.errors.name}
                    helperText={categoryForm.formState.errors.name?.message}
                  />
                )}
              />
              <Controller
                name="description"
                control={categoryForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="توضیحات"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!categoryForm.formState.errors.description}
                    helperText={categoryForm.formState.errors.description?.message}
                  />
                )}
              />
            </Stack>
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseCategory}>لغو</Button>
          <Button
            onClick={categoryForm.handleSubmit(onSubmitCategory)}
            variant="contained"
            disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
          >
            {createCategoryMutation.isPending || updateCategoryMutation.isPending
              ? 'در حال ذخیره...'
              : editingCategory
                ? 'به‌روزرسانی'
                : 'ایجاد'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
