import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Table, TableColumn } from './Table';
import { Button, Chip } from '@mui/material';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

const meta: Meta<typeof Table> = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Table component with pagination, loading states, and customizable columns.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    loading: {
      control: 'boolean',
      description: 'Loading state',
    },
    pagination: {
      control: 'boolean',
      description: 'Show pagination',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'Table size',
    },
    stickyHeader: {
      control: 'boolean',
      description: 'Sticky header',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Table<User>>;

const mockUsers: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Moderator', status: 'active' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'inactive' },
];

const columns: TableColumn<User>[] = [
  { id: 'id', label: 'ID', width: 80 },
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
  {
    id: 'role',
    label: 'Role',
    render: (value) => <Chip label={value} size="small" color="primary" />,
  },
  {
    id: 'status',
    label: 'Status',
    render: (value) => (
      <Chip
        label={value}
        size="small"
        color={value === 'active' ? 'success' : 'default'}
      />
    ),
  },
  {
    id: 'actions',
    label: 'Actions',
    align: 'right',
    render: () => (
      <Button size="small" variant="outlined">
        Edit
      </Button>
    ),
  },
];

export const Default: Story = {
  args: {
    columns,
    data: mockUsers,
  },
};

export const WithPagination: Story = {
  args: {
    columns,
    data: mockUsers,
    pagination: true,
    page: 0,
    rowsPerPage: 3,
    totalRows: 50,
    onPageChange: (page) => console.log('Page changed:', page),
    onRowsPerPageChange: (rowsPerPage) => console.log('Rows per page changed:', rowsPerPage),
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with pagination controls.',
      },
    },
  },
};

export const Loading: Story = {
  args: {
    columns,
    data: [],
    loading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Table in loading state with spinner.',
      },
    },
  },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
    emptyMessage: 'No users found',
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with empty state message.',
      },
    },
  },
};

export const Small: Story = {
  args: {
    columns,
    data: mockUsers,
    size: 'small',
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with small size (more compact).',
      },
    },
  },
};

export const StickyHeader: Story = {
  args: {
    columns,
    data: Array.from({ length: 20 }).map((_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: 'User',
      status: i % 2 === 0 ? 'active' : 'inactive',
    })),
    stickyHeader: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with sticky header that stays visible when scrolling.',
      },
    },
  },
};

export const CustomRender: Story = {
  args: {
    columns: [
      { id: 'name', label: 'Name' },
      { id: 'email', label: 'Email' },
      {
        id: 'actions',
        label: 'Actions',
        align: 'right',
        render: (_, row) => (
          <>
            <Button size="small" variant="outlined" sx={{ mr: 1 }}>
              Edit
            </Button>
            <Button size="small" variant="outlined" color="error">
              Delete
            </Button>
          </>
        ),
      },
    ],
    data: mockUsers,
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with custom render functions for cells.',
      },
    },
  },
};

