import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Breadcrumb from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'چیدمان/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/exams/create',
      },
    },
    docs: {
      description: {
        component:
          'مسیر ناوبری صفحات داخلی. همیشه با «داشبورد» شروع می‌شود؛ آیتم آخر بدون لینک است.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const TwoLevels: Story = {
  args: {
    items: [{ label: 'مدیریت آزمون‌ها', href: '/exams' }, { label: 'ایجاد آزمون' }],
  },
};

export const ThreeLevels: Story = {
  args: {
    items: [
      { label: 'مدیریت آزمون‌ها', href: '/exams' },
      { label: 'ریاضی پایه دهم', href: '/exams/42' },
      { label: 'شرکت‌کنندگان' },
    ],
  },
};

export const SingleLevel: Story = {
  args: {
    items: [{ label: 'پروفایل' }],
  },
};

export const LongLabels: Story = {
  args: {
    items: [
      { label: 'مدیریت آزمون‌ها', href: '/exams' },
      {
        label: 'آزمون جامع فیزیک و شیمی — نوبت دوم سال تحصیلی ۱۴۰۴',
      },
    ],
  },
};
