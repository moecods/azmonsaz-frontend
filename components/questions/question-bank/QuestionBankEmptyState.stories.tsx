import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { QuestionBankEmptyState } from './QuestionBankEmptyState';

const meta: Meta<typeof QuestionBankEmptyState> = {
  title: 'سوالات/بانک — حالت خالی',
  component: QuestionBankEmptyState,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'حالت خالی لیست سوالات یا آزمون‌ها وقتی فیلتر/جستجو نتیجه‌ای ندارد.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof QuestionBankEmptyState>;

export const Default: Story = {
  args: {},
};

export const NoExams: Story = {
  args: {
    title: 'آزمونی یافت نشد',
    description: 'هنوز آزمونی ایجاد نکرده‌اید یا فیلترها نتیجه‌ای ندارند.',
    action: {
      label: 'ایجاد آزمون جدید',
      onClick: fn(),
    },
  },
};

export const SearchNoResults: Story = {
  args: {
    title: 'نتیجه‌ای برای جستجو نیست',
    description: 'عبارت جستجو را تغییر دهید یا فیلترها را پاک کنید.',
  },
};

export const WithAction: Story = {
  args: {
    title: 'سوالی در بانک نیست',
    description: 'اولین سوال خود را بسازید تا در آزمون‌ها استفاده کنید.',
    action: {
      label: 'افزودن سوال',
      onClick: fn(),
    },
  },
};
