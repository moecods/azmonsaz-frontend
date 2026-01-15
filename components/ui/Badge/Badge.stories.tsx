import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Badge } from './Badge';
import { Box, Stack, IconButton, Avatar } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MailIcon from '@mui/icons-material/Mail';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Badge component for displaying notifications, counts, or status indicators.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['standard', 'dot'],
      description: 'Badge variant',
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning'],
      description: 'Badge color',
    },
    badgeContent: {
      control: 'text',
      description: 'Badge content (number or text)',
    },
    showZero: {
      control: 'boolean',
      description: 'Show badge even when badgeContent is 0',
    },
    max: {
      control: 'number',
      description: 'Maximum number to show (for numbers)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    badgeContent: 4,
    children: <IconButton><NotificationsIcon /></IconButton>,
  },
};

export const Colors: Story = {
  render: () => (
    <Stack spacing={3} direction="row" alignItems="center">
      <Badge badgeContent={4} color="primary">
        <IconButton><NotificationsIcon /></IconButton>
      </Badge>
      <Badge badgeContent={4} color="secondary">
        <IconButton><MailIcon /></IconButton>
      </Badge>
      <Badge badgeContent={4} color="error">
        <IconButton><ShoppingCartIcon /></IconButton>
      </Badge>
      <Badge badgeContent={4} color="success">
        <IconButton><NotificationsIcon /></IconButton>
      </Badge>
      <Badge badgeContent={4} color="warning">
        <IconButton><MailIcon /></IconButton>
      </Badge>
      <Badge badgeContent={4} color="info">
        <IconButton><ShoppingCartIcon /></IconButton>
      </Badge>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badge with different color options.',
      },
    },
  },
};

export const Variants: Story = {
  render: () => (
    <Stack spacing={3} direction="row" alignItems="center">
      <Badge badgeContent={4} variant="standard">
        <IconButton><NotificationsIcon /></IconButton>
      </Badge>
      <Badge variant="dot" color="error">
        <IconButton><MailIcon /></IconButton>
      </Badge>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Standard badge with count and dot variant.',
      },
    },
  },
};

export const WithMax: Story = {
  render: () => (
    <Stack spacing={3} direction="row" alignItems="center">
      <Badge badgeContent={99} max={99}>
        <IconButton><NotificationsIcon /></IconButton>
      </Badge>
      <Badge badgeContent={100} max={99}>
        <IconButton><MailIcon /></IconButton>
      </Badge>
      <Badge badgeContent={1000} max={99}>
        <IconButton><ShoppingCartIcon /></IconButton>
      </Badge>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badge with max value. Numbers exceeding max will show as "max+".',
      },
    },
  },
};

export const WithAvatar: Story = {
  render: () => (
    <Stack spacing={3} direction="row" alignItems="center">
      <Badge badgeContent={4} color="error">
        <Avatar>JD</Avatar>
      </Badge>
      <Badge variant="dot" color="success">
        <Avatar src="/avatar.jpg" alt="User" />
      </Badge>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badge with avatar.',
      },
    },
  },
};

export const ShowZero: Story = {
  render: () => (
    <Stack spacing={3} direction="row" alignItems="center">
      <Badge badgeContent={0} showZero={false}>
        <IconButton><NotificationsIcon /></IconButton>
      </Badge>
      <Badge badgeContent={0} showZero color="error">
        <IconButton><MailIcon /></IconButton>
      </Badge>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badge with showZero prop. When false, badge is hidden when content is 0.',
      },
    },
  },
};

export const TextContent: Story = {
  render: () => (
    <Stack spacing={3} direction="row" alignItems="center">
      <Badge badgeContent="New" color="error">
        <IconButton><NotificationsIcon /></IconButton>
      </Badge>
      <Badge badgeContent="99+" color="primary">
        <IconButton><MailIcon /></IconButton>
      </Badge>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badge with text content instead of numbers.',
      },
    },
  },
};

