import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Alert } from './Alert';
import { Stack } from '@mui/material';

const meta: Meta<typeof Alert> = {
  title: 'Feedback/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Alert component for displaying important messages to users. Supports different severity levels and variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    severity: {
      control: 'select',
      options: ['error', 'warning', 'info', 'success'],
      description: 'Alert severity level',
    },
    variant: {
      control: 'select',
      options: ['standard', 'filled', 'outlined'],
      description: 'Alert variant style',
    },
    onClose: { action: 'closed' },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    children: 'This is an alert message',
    severity: 'info',
  },
};

export const Severities: Story = {
  render: () => (
    <Stack spacing={2} sx={{ minWidth: 400 }}>
      <Alert severity="error">This is an error alert message.</Alert>
      <Alert severity="warning">This is a warning alert message.</Alert>
      <Alert severity="info">This is an info alert message.</Alert>
      <Alert severity="success">This is a success alert message.</Alert>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different alert severity levels: error, warning, info, and success.',
      },
    },
  },
};

export const Variants: Story = {
  render: () => (
    <Stack spacing={2} sx={{ minWidth: 400 }}>
      <Alert severity="info" variant="standard">
        Standard variant
      </Alert>
      <Alert severity="info" variant="filled">
        Filled variant
      </Alert>
      <Alert severity="info" variant="outlined">
        Outlined variant
      </Alert>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different alert variants: standard, filled, and outlined.',
      },
    },
  },
};

export const Closable: Story = {
  args: {
    severity: 'info',
    onClose: () => {},
    children: 'This alert can be closed',
  },
  parameters: {
    docs: {
      description: {
        story: 'Alert with close button. Use onClose prop to handle close action.',
      },
    },
  },
};

export const WithTitle: Story = {
  args: {
    severity: 'warning',
    title: 'Warning',
    children: 'This is a warning message with a title.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Alert with a title for more prominent messaging.',
      },
    },
  },
};

export const LongMessage: Story = {
  args: {
    severity: 'info',
    children:
      'This is a longer alert message that demonstrates how the component handles text that spans multiple lines. The alert will automatically adjust its height to accommodate the content.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Alert with longer text content.',
      },
    },
  },
};

