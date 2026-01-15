import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Loading } from './Loading';
import { Box, Stack, Typography } from '@mui/material';

const meta: Meta<typeof Loading> = {
  title: 'Feedback/Loading',
  component: Loading,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Loading component for displaying loading states. Supports different sizes and full-screen mode.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Loading spinner size',
    },
    fullScreen: {
      control: 'boolean',
      description: 'Display as full-screen overlay',
    },
    message: {
      control: 'text',
      description: 'Optional loading message',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Loading>;

export const Default: Story = {
  args: {},
};

export const WithMessage: Story = {
  args: {
    message: 'Loading...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading spinner with a message below it.',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack spacing={4} direction="row" alignItems="center">
      <Box textAlign="center">
        <Loading size="small" />
        <Typography variant="caption" display="block" mt={1}>
          Small
        </Typography>
      </Box>
      <Box textAlign="center">
        <Loading size="medium" />
        <Typography variant="caption" display="block" mt={1}>
          Medium
        </Typography>
      </Box>
      <Box textAlign="center">
        <Loading size="large" />
        <Typography variant="caption" display="block" mt={1}>
          Large
        </Typography>
      </Box>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different loading spinner sizes.',
      },
    },
  },
};

export const FullScreen: Story = {
  args: {
    fullScreen: true,
    message: 'Loading page...',
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Full-screen loading overlay. Useful for page-level loading states.',
      },
    },
  },
};

export const Inline: Story = {
  render: () => (
    <Box sx={{ p: 3, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="body1" gutterBottom>
        Content before loading
      </Typography>
      <Loading size="small" message="Loading data..." />
      <Typography variant="body1" sx={{ mt: 2 }}>
        Content after loading
      </Typography>
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Inline loading spinner within content.',
      },
    },
  },
};

