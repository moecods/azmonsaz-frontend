import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import DashboardEmptyState from './DashboardEmptyState';

const meta: Meta<typeof DashboardEmptyState> = {
  title: 'داشبورد/حالت خالی دانش‌آموز',
  component: DashboardEmptyState,
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/dashboard' },
    },
    docs: {
      description: {
        component: 'وقتی دانش‌آموز هنوز در آزمونی ثبت‌نام نکرده — داشبورد اصلی.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DashboardEmptyState>;

export const Default: Story = {};
