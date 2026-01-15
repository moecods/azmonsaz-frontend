import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Modal } from './Modal';
import { Button, Typography, Box } from '@mui/material';
import React, { useState } from 'react';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Modal/Dialog component with consistent styling and easy-to-use API.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Modal title',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Show close button',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width modal',
    },
    maxWidth: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', false],
      description: 'Max width',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

const ModalWrapper: React.FC<{ children: React.ReactNode; [key: string]: any }> = ({
  children,
  ...props
}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal {...props} open={open} onClose={() => setOpen(false)}>
        {children}
      </Modal>
    </>
  );
};

export const Default: Story = {
  render: () => (
    <ModalWrapper title="Default Modal">
      <Typography>This is a default modal with title and close button.</Typography>
    </ModalWrapper>
  ),
};

export const WithActions: Story = {
  render: () => (
    <ModalWrapper
      title="Confirm Action"
      actions={
        <>
          <Button onClick={() => {}}>Cancel</Button>
          <Button variant="contained" onClick={() => {}}>
            Confirm
          </Button>
        </>
      }
    >
      <Typography>Are you sure you want to proceed with this action?</Typography>
    </ModalWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Modal with action buttons at the bottom.',
      },
    },
  },
};

export const WithoutTitle: Story = {
  render: () => (
    <ModalWrapper>
      <Typography>This modal has no title.</Typography>
    </ModalWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Modal without title.',
      },
    },
  },
};

export const WithoutCloseButton: Story = {
  render: () => (
    <ModalWrapper title="Modal Without Close Button" showCloseButton={false}>
      <Typography>This modal has no close button in the header.</Typography>
    </ModalWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Modal without close button (you can still close it by clicking outside or pressing ESC).',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <ModalWrapper title="Extra Small" maxWidth="xs">
        <Typography>This is an extra small modal.</Typography>
      </ModalWrapper>
      <ModalWrapper title="Small" maxWidth="sm">
        <Typography>This is a small modal.</Typography>
      </ModalWrapper>
      <ModalWrapper title="Medium" maxWidth="md">
        <Typography>This is a medium modal.</Typography>
      </ModalWrapper>
      <ModalWrapper title="Large" maxWidth="lg">
        <Typography>This is a large modal.</Typography>
      </ModalWrapper>
      <ModalWrapper title="Extra Large" maxWidth="xl">
        <Typography>This is an extra large modal.</Typography>
      </ModalWrapper>
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Modal with different max widths: xs, sm, md, lg, xl.',
      },
    },
  },
};

export const FullWidth: Story = {
  render: () => (
    <ModalWrapper title="Full Width Modal" fullWidth maxWidth="md">
      <Typography>This modal takes full width up to its maxWidth.</Typography>
    </ModalWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Full width modal that takes the full width of the screen (up to maxWidth).',
      },
    },
  },
};

export const LongContent: Story = {
  render: () => (
    <ModalWrapper title="Modal with Long Content" maxWidth="md">
      <Box sx={{ height: 400, overflow: 'auto' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <Typography key={i} paragraph>
            This is paragraph {i + 1}. Modal content can be scrollable when it exceeds the viewport height.
          </Typography>
        ))}
      </Box>
    </ModalWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Modal with long scrollable content.',
      },
    },
  },
};

