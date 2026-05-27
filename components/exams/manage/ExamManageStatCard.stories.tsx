import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { ExamManageStatCard } from './ExamManageStatCard';

const meta: Meta<typeof ExamManageStatCard> = {
  title: 'آزمون/مدیریت — کارت آمار',
  component: ExamManageStatCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'نمایش یک شاخص در هدر صفحه مدیریت آزمون.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ExamManageStatCard>;

export const Default: Story = {
  args: {
    icon: <PeopleIcon />,
    label: 'شرکت‌کنندگان',
    value: 42,
    tone: 'primary',
  },
};

export const Tones: Story = {
  render: () => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(140px, 1fr))',
        gap: 1.5,
        maxWidth: 360,
      }}
    >
      <ExamManageStatCard
        icon={<PeopleIcon />}
        label="ثبت‌نام"
        value={120}
        tone="primary"
      />
      <ExamManageStatCard
        icon={<CheckCircleIcon />}
        label="تکمیل‌شده"
        value={85}
        tone="success"
      />
      <ExamManageStatCard
        icon={<ScheduleIcon />}
        label="در انتظار"
        value={12}
        tone="warning"
      />
      <ExamManageStatCard
        icon={<PeopleIcon />}
        label="غایب"
        value={5}
        tone="error"
      />
    </Box>
  ),
};
