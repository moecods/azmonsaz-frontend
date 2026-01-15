import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Input } from './Input';
import { Box, Stack } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import SearchIcon from '@mui/icons-material/Search';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Input component with consistent styling, password toggle, and adornments.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['outlined', 'filled', 'standard'],
      description: 'Input variant style',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'Input type',
    },
    showPasswordToggle: {
      control: 'boolean',
      description: 'Show password toggle (only for type="password")',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width input',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable input',
    },
    required: {
      control: 'boolean',
      description: 'Required field',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: 'Input',
    placeholder: 'Enter text',
  },
};

export const Variants: Story = {
  render: () => (
    <Stack spacing={3} sx={{ width: 400 }}>
      <Input variant="outlined" label="Outlined" placeholder="Outlined input" />
      <Input variant="filled" label="Filled" placeholder="Filled input" />
      <Input variant="standard" label="Standard" placeholder="Standard input" />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different input variants: outlined, filled, and standard.',
      },
    },
  },
};

export const WithIcons: Story = {
  render: () => (
    <Stack spacing={3} sx={{ width: 400 }}>
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        startAdornment={<EmailIcon />}
      />
      <Input
        label="Search"
        placeholder="Search..."
        startAdornment={<SearchIcon />}
      />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input with start adornment icons.',
      },
    },
  },
};

export const Password: Story = {
  render: () => (
    <Stack spacing={3} sx={{ width: 400 }}>
      <Input
        label="Password"
        type="password"
        placeholder="Enter password"
        showPasswordToggle
      />
      <Input
        label="Password (no toggle)"
        type="password"
        placeholder="Enter password"
      />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Password input with toggle visibility button.',
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <Stack spacing={3} sx={{ width: 400 }}>
      <Input label="Normal" placeholder="Normal state" />
      <Input label="Disabled" placeholder="Disabled input" disabled />
      <Input label="Required" placeholder="Required field" required />
      <Input
        label="Error"
        placeholder="Error state"
        error
        helperText="This field has an error"
      />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different input states: normal, disabled, required, and error.',
      },
    },
  },
};

export const FullWidth: Story = {
  render: () => (
    <Box sx={{ width: '100%', maxWidth: 600 }}>
      <Input
        label="Full Width Input"
        placeholder="This input takes full width"
        fullWidth
      />
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Full width input that takes the full width of its container.',
      },
    },
  },
};

