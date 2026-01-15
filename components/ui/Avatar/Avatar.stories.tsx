import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Avatar } from './Avatar';
import { Stack, Box } from '@mui/material';

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Avatar component for displaying user profile pictures or initials.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Avatar size',
    },
    variant: {
      control: 'select',
      options: ['circular', 'rounded', 'square'],
      description: 'Avatar variant',
    },
    showOnline: {
      control: 'boolean',
      description: 'Show online status indicator',
    },
    online: {
      control: 'boolean',
      description: 'Online status',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    children: 'JD',
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack spacing={3} direction="row" alignItems="center">
      <Avatar size="small">JD</Avatar>
      <Avatar size="medium">JD</Avatar>
      <Avatar size="large">JD</Avatar>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different avatar sizes: small (32px), medium (40px), and large (56px).',
      },
    },
  },
};

export const Variants: Story = {
  render: () => (
    <Stack spacing={3} direction="row" alignItems="center">
      <Avatar variant="circular">JD</Avatar>
      <Avatar variant="rounded">JD</Avatar>
      <Avatar variant="square">JD</Avatar>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different avatar variants: circular, rounded, and square.',
      },
    },
  },
};

export const WithImage: Story = {
  render: () => (
    <Stack spacing={3} direction="row" alignItems="center">
      <Avatar
        src="https://i.pravatar.cc/150?img=1"
        alt="User 1"
        size="small"
      />
      <Avatar
        src="https://i.pravatar.cc/150?img=2"
        alt="User 2"
        size="medium"
      />
      <Avatar
        src="https://i.pravatar.cc/150?img=3"
        alt="User 3"
        size="large"
      />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar with image source.',
      },
    },
  },
};

export const WithInitials: Story = {
  render: () => (
    <Stack spacing={3} direction="row" alignItems="center">
      <Avatar>JD</Avatar>
      <Avatar>AB</Avatar>
      <Avatar>CD</Avatar>
      <Avatar>EF</Avatar>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar with initials when no image is provided.',
      },
    },
  },
};

export const WithOnlineStatus: Story = {
  render: () => (
    <Stack spacing={3} direction="row" alignItems="center">
      <Avatar showOnline online size="small">
        JD
      </Avatar>
      <Avatar showOnline online size="medium">
        AB
      </Avatar>
      <Avatar showOnline online size="large">
        CD
      </Avatar>
      <Avatar showOnline online={false} size="medium">
        EF
      </Avatar>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar with online status indicator (green dot at bottom right).',
      },
    },
  },
};

export const Colors: Story = {
  render: () => (
    <Stack spacing={3} direction="row" alignItems="center">
      <Avatar sx={{ bgcolor: 'primary.main' }}>JD</Avatar>
      <Avatar sx={{ bgcolor: 'secondary.main' }}>AB</Avatar>
      <Avatar sx={{ bgcolor: 'error.main' }}>CD</Avatar>
      <Avatar sx={{ bgcolor: 'success.main' }}>EF</Avatar>
      <Avatar sx={{ bgcolor: 'warning.main' }}>GH</Avatar>
      <Avatar sx={{ bgcolor: 'info.main' }}>IJ</Avatar>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar with different background colors.',
      },
    },
  },
};

