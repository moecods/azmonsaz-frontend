import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Card } from './Card';
import { CardContent, CardHeader, Typography, Stack, Button } from '@mui/material';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Card component for displaying content in a contained format. Supports different variants and elevations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['elevation', 'outlined'],
      description: 'Card variant style',
    },
    elevation: {
      control: { type: 'number', min: 0, max: 24, step: 1 },
      description: 'Elevation level (shadow depth)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card sx={{ minWidth: 300 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Card Title
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This is a simple card with content.
        </Typography>
      </CardContent>
    </Card>
  ),
};

export const WithHeader: Story = {
  render: () => (
    <Card sx={{ minWidth: 300 }}>
      <CardHeader title="Card Header" subheader="Card Subheader" />
      <CardContent>
        <Typography variant="body2">
          Card content goes here. You can add any content you want inside the card.
        </Typography>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Card with header and subheader.',
      },
    },
  },
};

export const Variants: Story = {
  render: () => (
    <Stack spacing={2} direction="row">
      <Card variant="elevation" elevation={2} sx={{ minWidth: 200 }}>
        <CardContent>
          <Typography variant="h6">Elevated</Typography>
          <Typography variant="body2" color="text.secondary">
            Card with elevation
          </Typography>
        </CardContent>
      </Card>
      <Card variant="outlined" sx={{ minWidth: 200 }}>
        <CardContent>
          <Typography variant="h6">Outlined</Typography>
          <Typography variant="body2" color="text.secondary">
            Card with border
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different card variants: elevation and outlined.',
      },
    },
  },
};

export const WithActions: Story = {
  render: () => (
    <Card sx={{ minWidth: 300 }}>
      <CardHeader title="Card with Actions" />
      <CardContent>
        <Typography variant="body2" gutterBottom>
          This card includes action buttons.
        </Typography>
      </CardContent>
      <Stack direction="row" spacing={1} sx={{ p: 2, pt: 0 }}>
        <Button size="small">Action 1</Button>
        <Button size="small" variant="outlined">
          Action 2
        </Button>
      </Stack>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Card with action buttons at the bottom.',
      },
    },
  },
};

export const ElevationLevels: Story = {
  render: () => (
    <Stack spacing={2} direction="row" flexWrap="wrap">
      {[0, 2, 4, 8].map((elevation) => (
        <Card key={elevation} elevation={elevation} sx={{ minWidth: 150 }}>
          <CardContent>
            <Typography variant="h6">Elevation {elevation}</Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Cards with different elevation levels (shadow depths).',
      },
    },
  },
};

