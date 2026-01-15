import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from './Button';
import { Box, Stack } from '@mui/material';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Button component with multiple variants and sizes. Supports loading state and disabled state.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['contained', 'outlined', 'text'],
      description: 'Button variant style',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Button size',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
      description: 'Button color',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width button',
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'contained',
    color: 'primary',
  },
};

export const Variants: Story = {
  render: () => (
    <Stack spacing={2} direction="row">
      <Button variant="contained">Contained</Button>
      <Button variant="outlined">Outlined</Button>
      <Button variant="text">Text</Button>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different button variants: contained, outlined, and text.',
      },
    },
  },
};

export const Colors: Story = {
  render: () => (
    <Stack spacing={2} direction="row" flexWrap="wrap">
      <Button color="primary">Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="error">Error</Button>
      <Button color="warning">Warning</Button>
      <Button color="info">Info</Button>
      <Button color="success">Success</Button>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button with different color options.',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack spacing={2} direction="row" alignItems="center">
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different button sizes: small, medium, and large.',
      },
    },
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button in loading state with spinner. Automatically disabled when loading.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled button that cannot be clicked.',
      },
    },
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button that takes full width of its container.',
      },
    },
  },
};

export const WithIcon: Story = {
  render: () => (
    <Stack spacing={2} direction="row">
      <Button startIcon={<span>🚀</span>}>Start Icon</Button>
      <Button endIcon={<span>✓</span>}>End Icon</Button>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button with icons at the start or end.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    children: 'Click me',
    onClick: () => alert('Button clicked!'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive button with click handler.',
      },
    },
  },
};

