import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { ExamCreateHeader } from './ExamCreateHeader';

const meta: Meta<typeof ExamCreateHeader> = {
  title: 'آزمون/ساخت — هدر صفحه',
  component: ExamCreateHeader,
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
        component: 'هدر صفحه ایجاد/ویرایش آزمون با breadcrumb و خلاصه راهنما.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    onBack: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ExamCreateHeader>;

export const Create: Story = {
  args: {
    isEdit: false,
  },
};

export const Edit: Story = {
  args: {
    isEdit: true,
  },
};

export const WithPartner: Story = {
  args: {
    isEdit: false,
    partnerName: 'آموزشگاه نمونه',
  },
};
