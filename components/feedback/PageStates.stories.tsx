import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '@mui/material';
import { PageLoading, PageError, EmptyState } from './PageStates';

const meta: Meta = {
  title: 'بازخورد/وضعیت صفحه',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'الگوهای استاندارد بارگذاری، خطا و خالی بودن داده در صفحات اپ.',
      },
    },
  },
  tags: ['autodocs', 'visual'],
};

export default meta;

export const Loading: StoryObj = {
  render: () => <PageLoading message="در حال بارگذاری آزمون‌ها..." />,
};

export const LoadingFullscreen: StoryObj = {
  render: () => <PageLoading message="در حال بارگذاری..." fullScreen />,
};

export const Error: StoryObj = {
  render: () => (
    <PageError
      title="خطا در دریافت اطلاعات"
      error="ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید."
      onRetry={() => alert('تلاش مجدد')}
    />
  ),
};

export const Empty: StoryObj = {
  tags: ['visual'],
  render: () => (
    <EmptyState
      title="آزمونی یافت نشد"
      message="هنوز آزمونی ایجاد نکرده‌اید یا فیلترها نتیجه‌ای ندارند."
      action={
        <Button variant="contained" size="small">
          ایجاد آزمون جدید
        </Button>
      }
    />
  ),
};
