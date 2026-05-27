"use client";

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within, screen, waitFor } from 'storybook/test';
import { useForm } from 'react-hook-form';
import { Stack, Button } from '@mui/material';
import { FormSelect } from './FormSelect/FormSelect';

interface DemoForm {
  created_by: number | '';
  type: string;
}

const meta: Meta<typeof FormSelect> = {
  title: 'فرم/انتخاب',
  component: FormSelect,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Select متصل به react-hook-form — مثلاً انتخاب مسئول آزمون.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormSelect>;

const teacherOptions = [
  { value: 1, label: 'علی محمدی (معلم)' },
  { value: 2, label: 'زهرا حسینی (معلم)' },
  { value: 3, label: 'مدیر سیستم (مدیر)' },
];

export const Default: Story = {
  render: function FormSelectDemo() {
    const { control, handleSubmit } = useForm<DemoForm>({
      defaultValues: { created_by: '', type: 'online' },
    });

    return (
      <form onSubmit={handleSubmit(() => undefined)}>
        <Stack spacing={2} sx={{ maxWidth: 420 }}>
          <FormSelect
            name="created_by"
            control={control}
            label="مسئول آزمون"
            required
            options={teacherOptions}
          />
          <FormSelect
            name="type"
            control={control}
            label="نوع برگزاری"
            options={[
              { value: 'online', label: 'آنلاین' },
              { value: 'offline', label: 'آفلاین' },
            ]}
          />
          <Button type="submit" variant="outlined">
            ارسال
          </Button>
        </Stack>
      </form>
    );
  },
};

export const InteractionSelectOption: Story = {
  tags: ['test'],
  render: function FormSelectInteraction() {
    const { control } = useForm<DemoForm>({
      defaultValues: { created_by: '', type: 'online' },
    });

    return (
      <Stack spacing={2} sx={{ maxWidth: 420 }}>
        <FormSelect
          name="type"
          control={control}
          label="نوع برگزاری"
          options={[
            { value: 'online', label: 'آنلاین' },
            { value: 'offline', label: 'آفلاین' },
          ]}
        />
      </Stack>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: /نوع برگزاری/i });
    await userEvent.click(trigger);
    // منوی MUI Select در portal رندر می‌شود
    const listbox = await screen.findByRole('listbox');
    await userEvent.click(within(listbox).getByRole('option', { name: 'آفلاین' }));
    await waitFor(() => {
      expect(canvas.getByRole('combobox', { name: /نوع برگزاری/i })).toHaveTextContent('آفلاین');
    });
  },
};
