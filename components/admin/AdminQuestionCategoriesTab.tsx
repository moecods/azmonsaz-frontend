"use client";

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
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
} from '@mui/material';
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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface AdminQuestionCategoriesTabProps {
  isActive: boolean;
}

export function AdminQuestionCategoriesTab({ isActive }: AdminQuestionCategoriesTabProps) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<QuestionCategory | null>(null);

  const categoryForm = useForm<QuestionCategoryFormData>({
    resolver: zodResolver(questionCategorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesErrorDetail,
  } = useQuestionCategories(isActive);

  const createCategoryMutation = useCreateQuestionCategory();
  const updateCategoryMutation = useUpdateQuestionCategory();
  const deleteCategoryMutation = useDeleteQuestionCategory();

  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    categoryForm.reset({
      name: '',
      description: '',
    });
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
    categoryForm.reset({
      name: '',
      description: '',
    });
  };

  const onSubmitCategory = (data: QuestionCategoryFormData) => {
    if (editingCategory) {
      updateCategoryMutation.mutate(
        {
          id: editingCategory.id,
          data: {
            name: data.name,
            description: data.description || undefined,
          },
        },
        {
          onSuccess: () => {
            handleCloseCategory();
          },
        }
      );
    } else {
      createCategoryMutation.mutate(
        {
          name: data.name,
          description: data.description || undefined,
        },
        {
          onSuccess: () => {
            handleCloseCategory();
          },
        }
      );
    }
  };

  return (
    <>
      <Stack spacing={3}>
        {categoriesError && (
          <Alert severity="error">
            {categoriesErrorDetail instanceof Error
              ? categoriesErrorDetail.message
              : 'خطا در بارگذاری لیست دسته‌بندی‌ها'}
          </Alert>
        )}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">مدیریت دسته‌بندی سوالات</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateCategory}
            data-cy="admin-add-question-category"
          >
            افزودن دسته‌بندی
          </Button>
        </Stack>

        {categoriesLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>نام</TableCell>
                  <TableCell>توضیحات</TableCell>
                  <TableCell>تاریخ ایجاد</TableCell>
                  <TableCell>عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        هنوز دسته‌بندی‌ای ایجاد نشده است.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {category.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(category.created_at).toLocaleDateString('fa-IR', {
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
                            onClick={() => handleOpenEditCategory(category)}
                            title="ویرایش دسته‌بندی"
                            aria-label="ویرایش دسته‌بندی"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteCategory(category)}
                            disabled={deleteCategoryMutation.isPending}
                            title="حذف دسته‌بندی"
                            aria-label="حذف دسته‌بندی"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>

      <Dialog open={categoryOpen} onClose={handleCloseCategory} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'ویرایش دسته‌بندی' : 'ایجاد دسته‌بندی جدید'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)}>
            <Stack spacing={3} sx={{ mt: 2 }}>
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
        <DialogActions>
          <Button onClick={handleCloseCategory}>لغو</Button>
          <Button
            onClick={categoryForm.handleSubmit(onSubmitCategory)}
            variant="contained"
            disabled={
              createCategoryMutation.isPending || updateCategoryMutation.isPending
            }
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
