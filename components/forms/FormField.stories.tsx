"use client";

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { useForm } from 'react-hook-form';
import { Stack, Button } from '@mui/material';
import { FormField } from './FormField/FormField';

interface DemoForm {
  title: string;
  description: string;
}

const meta: Meta<typeof FormField> = {
  title: 'فرم/فیلد متنی',
  component: FormField,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'TextField متصل به react-hook-form با نمایش خطای validation.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormField>;

function FormFieldDemo({ defaultValues }: { defaultValues?: Partial<DemoForm> }) {
  const { control, handleSubmit } = useForm<DemoForm>({
    defaultValues: {
      title: '',
      description: '',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(() => undefined)}>
      <Stack spacing={2} sx={{ maxWidth: 420 }}>
        <FormField
          name="title"
          control={control}
          label="عنوان آزمون"
          required
          placeholder="مثال: ریاضی پایه دهم"
        />
        <FormField
          name="description"
          control={control}
          label="توضیح کوتاه"
          multiline
          rows={3}
          helperText="اختیاری — برای یادداشت داخلی"
        />
        <Button type="submit" variant="contained">
          اعتبارسنجی
        </Button>
      </Stack>
    </form>
  );
}

export const Default: Story = {
  render: () => <FormFieldDemo />,
};

export const WithValues: Story = {
  render: () => (
    <FormFieldDemo
      defaultValues={{
        title: 'آزمون نوبت اول',
        description: 'شامل فصل‌های ۱ تا ۳',
      }}
    />
  ),
};

export const InteractionTypeTitle: Story = {
  tags: ['test'],
  render: () => <FormFieldDemo />,
  play: async ({ canvas, userEvent: ue }) => {
    const input = canvas.getByLabelText(/عنوان آزمون/);
    await ue.clear(input);
    await ue.type(input, 'آزمون تعاملی');
    await expect(input).toHaveValue('آزمون تعاملی');
  },
};
