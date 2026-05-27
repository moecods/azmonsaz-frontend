"use client";

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within, screen, waitFor } from 'storybook/test';
import { Button, Stack } from '@mui/material';
import { Alert, Toast } from './Alert/Alert';

const meta: Meta<typeof Toast> = {
  title: 'بازخورد/اعلان Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'اعلان موقت (Snackbar) — در اپ از `Toast` استفاده می‌شود؛ `Alert` برای پیام‌های ثابت در صفحه.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Default: Story = {
  render: function ToastDemo() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="contained" onClick={() => setOpen(true)}>
          نمایش اعلان
        </Button>
        <Toast
          open={open}
          onClose={() => setOpen(false)}
          message="آزمون با موفقیت ذخیره شد."
          severity="success"
        />
      </>
    );
  },
};

/** تست تعامل — vitest + Storybook addon */
export const InteractionShowToast: Story = {
  tags: ['test'],
  render: function ToastInteraction() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="contained" onClick={() => setOpen(true)}>
          نمایش اعلان
        </Button>
        <Toast
          open={open}
          onClose={() => setOpen(false)}
          message="آزمون با موفقیت ذخیره شد."
          severity="success"
        />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'نمایش اعلان' }));
    // Snackbar در portal + transition دارد؛ visibility ممکن است دیر true شود
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('آزمون با موفقیت ذخیره شد.');
    });
  },
};

export const Severities: Story = {
  render: function SeveritiesDemo() {
    const [state, setState] = useState<{
      open: boolean;
      severity: 'success' | 'error' | 'warning' | 'info';
      message: string;
    }>({ open: false, severity: 'info', message: '' });

    const show = (severity: typeof state.severity, message: string) => {
      setState({ open: true, severity, message });
    };

    return (
      <>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          <Button onClick={() => show('success', 'عملیات موفق بود.')}>موفق</Button>
          <Button color="error" onClick={() => show('error', 'خطا در ذخیره‌سازی.')}>
            خطا
          </Button>
          <Button color="warning" onClick={() => show('warning', 'لطفاً فیلدها را بررسی کنید.')}>
            هشدار
          </Button>
          <Button color="info" onClick={() => show('info', 'اطلاعات به‌روز شد.')}>
            اطلاعات
          </Button>
        </Stack>
        <Toast
          open={state.open}
          severity={state.severity}
          message={state.message}
          onClose={() => setState((s) => ({ ...s, open: false }))}
        />
      </>
    );
  },
};

export const InlineAlert: Story = {
  render: () => (
    <Stack spacing={2} sx={{ minWidth: 360 }}>
      <Alert severity="success" title="موفق">
        شرکت‌کننده اضافه شد.
      </Alert>
      <Alert severity="error">دسترسی به این بخش مجاز نیست.</Alert>
      <Alert severity="warning" closable>
        مهلت ثبت‌نام تا فردا است.
      </Alert>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'هشدار ثابت در صفحه (بدون Snackbar).',
      },
    },
  },
};
