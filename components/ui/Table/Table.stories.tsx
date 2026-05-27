import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Table, TableColumn } from './Table';
import { Button, Chip } from '@mui/material';

interface QuestionRow {
  id: number;
  title: string;
  type: string;
  status: 'active' | 'draft';
}

const meta: Meta<typeof Table> = {
  title: 'رابط کاربری/جدول',
  component: Table,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'جدول با صفحه‌بندی، حالت بارگذاری و ستون‌های سفارشی. در بانک سوالات استفاده می‌شود.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Table<QuestionRow>>;

const mockRows: QuestionRow[] = [
  { id: 1, title: 'معادله درجه دوم', type: 'چندگزینه‌ای', status: 'active' },
  { id: 2, title: 'تعریف مشتق', type: 'تشریحی', status: 'active' },
  { id: 3, title: 'سوال نمونه', type: 'صحیح/غلط', status: 'draft' },
];

const columns: TableColumn<QuestionRow>[] = [
  { id: 'id', label: 'شناسه', width: 72 },
  { id: 'title', label: 'عنوان سوال' },
  {
    id: 'type',
    label: 'نوع',
    render: (value) => <Chip label={String(value)} size="small" variant="outlined" />,
  },
  {
    id: 'status',
    label: 'وضعیت',
    render: (value) => (
      <Chip
        label={value === 'active' ? 'فعال' : 'پیش‌نویس'}
        size="small"
        color={value === 'active' ? 'success' : 'default'}
      />
    ),
  },
  {
    id: 'actions',
    label: 'عملیات',
    align: 'left',
    render: () => (
      <Button size="small" variant="outlined">
        ویرایش
      </Button>
    ),
  },
];

export const Default: Story = {
  args: {
    columns,
    data: mockRows,
  },
};

export const WithPagination: Story = {
  args: {
    columns,
    data: mockRows,
    pagination: true,
    page: 0,
    rowsPerPage: 3,
    totalRows: 24,
  },
};

export const Loading: Story = {
  args: {
    columns,
    data: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
    emptyMessage: 'سوالی یافت نشد',
  },
};
