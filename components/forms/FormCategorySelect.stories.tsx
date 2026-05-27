"use client";

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Box } from '@mui/material';
import { FormCategorySelect } from './FormCategorySelect/FormCategorySelect';
import { queryKeys } from '@/lib/query-client';

const MOCK_CATEGORIES = [
  { id: 1, name: 'ریاضی — جبر' },
  { id: 2, name: 'ریاضی — هندسه' },
  { id: 3, name: 'فیزیک — مکانیک' },
  { id: 4, name: 'شیمی — عمومی' },
  { id: 5, name: 'ادبیات فارسی' },
];

const meta: Meta<typeof FormCategorySelect> = {
  title: 'فرم/دسته‌بندی سوال',
  component: FormCategorySelect,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Autocomplete دسته‌بندی با جستجو — در فرم ایجاد/ویرایش سوال.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormCategorySelect>;

function CategorySelectDemo({ categoryId }: { categoryId?: number | null }) {
  const queryClient = useMemo(() => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    client.setQueryData(queryKeys.questionCategories(), MOCK_CATEGORIES);
    return client;
  }, []);

  const { control } = useForm<{ category_id: number | null }>({
    defaultValues: { category_id: categoryId ?? null },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Box sx={{ maxWidth: 420 }}>
        <FormCategorySelect name="category_id" control={control} required />
      </Box>
    </QueryClientProvider>
  );
}

export const Default: Story = {
  render: () => <CategorySelectDemo />,
};

export const WithSelection: Story = {
  render: () => <CategorySelectDemo categoryId={2} />,
};
