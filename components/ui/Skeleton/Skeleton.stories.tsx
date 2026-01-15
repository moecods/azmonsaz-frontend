import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Skeleton, SkeletonLoading } from './Skeleton';
import { Box, Stack, Paper } from '@mui/material';

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Skeleton component for loading placeholders.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular', 'rounded'],
      description: 'Skeleton variant',
    },
    animation: {
      control: 'select',
      options: ['pulse', 'wave', false],
      description: 'Animation type',
    },
    width: {
      control: 'text',
      description: 'Width (number or string)',
    },
    height: {
      control: 'text',
      description: 'Height (number or string)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    variant: 'text',
    width: 200,
    height: 24,
  },
};

export const Variants: Story = {
  render: () => (
    <Stack spacing={3} sx={{ width: 400 }}>
      <Skeleton variant="text" width="100%" height={24} />
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton variant="rectangular" width="100%" height={100} />
      <Skeleton variant="rounded" width="100%" height={100} />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different skeleton variants: text, circular, rectangular, and rounded.',
      },
    },
  },
};

export const Animations: Story = {
  render: () => (
    <Stack spacing={3} sx={{ width: 400 }}>
      <Skeleton variant="text" width="100%" height={24} animation="pulse" />
      <Skeleton variant="text" width="100%" height={24} animation="wave" />
      <Skeleton variant="text" width="100%" height={24} animation={false} />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different animation types: pulse, wave, and no animation.',
      },
    },
  },
};

export const CardSkeleton: Story = {
  render: () => (
    <Paper sx={{ p: 3, width: 400 }}>
      <Stack spacing={2}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="rectangular" width="100%" height={200} />
      </Stack>
    </Paper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Skeleton for a card component layout.',
      },
    },
  },
};

export const ListSkeleton: Story = {
  render: () => (
    <Stack spacing={2} sx={{ width: 400 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        </Box>
      ))}
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Skeleton for a list layout with avatars.',
      },
    },
  },
};

export const SkeletonLoadingComponent: Story = {
  render: () => (
    <Box sx={{ width: 400 }}>
      <SkeletonLoading lines={3} />
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: 'SkeletonLoading component for content placeholders.',
      },
    },
  },
};

export const SkeletonLoadingWithAvatar: Story = {
  render: () => (
    <Box sx={{ width: 400 }}>
      <SkeletonLoading lines={3} showAvatar avatarSize="medium" />
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: 'SkeletonLoading with avatar placeholder.',
      },
    },
  },
};

export const DifferentSizes: Story = {
  render: () => (
    <Stack spacing={3} sx={{ width: 400 }}>
      <Skeleton variant="text" width="100%" height={16} />
      <Skeleton variant="text" width="100%" height={20} />
      <Skeleton variant="text" width="100%" height={24} />
      <Skeleton variant="text" width="100%" height={32} />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Skeleton with different heights for text.',
      },
    },
  },
};

