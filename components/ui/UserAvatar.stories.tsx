import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Stack, Typography } from '@mui/material';
import UserAvatar from './UserAvatar';

const meta: Meta<typeof UserAvatar> = {
  title: 'رابط کاربری/آواتار کاربر',
  component: UserAvatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'آواتار با حروف اول نام در صورت نبود تصویر؛ در منو و لیست گروه‌ها استفاده می‌شود.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    avatarUrl: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof UserAvatar>;

export const WithInitials: Story = {
  args: {
    name: 'علی رضایی',
    sx: { width: 56, height: 56 },
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="row" spacing={2} alignItems="center">
      <UserAvatar name="مریم احمدی" sx={{ width: 32, height: 32 }} />
      <UserAvatar name="مریم احمدی" sx={{ width: 48, height: 48 }} />
      <UserAvatar name="مریم احمدی" sx={{ width: 64, height: 64 }} />
    </Stack>
  ),
};

export const NoName: Story = {
  args: {
    sx: { width: 48, height: 48 },
  },
};

export const WithBrokenImage: Story = {
  render: () => (
    <Stack spacing={1} alignItems="center">
      <UserAvatar
        name="حسین کریمی"
        avatarUrl="https://invalid.example/avatar.jpg"
        sx={{ width: 56, height: 56 }}
      />
      <Typography variant="caption" color="text.secondary">
        در صورت خطای تصویر، حروف اول نمایش داده می‌شود
      </Typography>
    </Stack>
  ),
};
