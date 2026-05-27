"use client";

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm } from 'react-hook-form';
import { Stack, Box } from '@mui/material';
import { FormNumberField } from './FormNumberField/FormNumberField';

interface DemoForm {
  duration_minutes: number | null;
  passing_score: number | null;
}

const meta: Meta<typeof FormNumberField> = {
  title: 'فرم/فیلد عددی',
  component: FormNumberField,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ورودی عددی با react-hook-form — مدت آزمون، درصد قبولی و...',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormNumberField>;

function NumberFieldDemo({ defaults }: { defaults?: Partial<DemoForm> }) {
  const { control } = useForm<DemoForm>({
    defaultValues: {
      duration_minutes: null,
      passing_score: null,
      ...defaults,
    },
  });

  return (
    <Stack spacing={2} sx={{ maxWidth: 360 }}>
      <FormNumberField
        name="duration_minutes"
        control={control}
        label="مدت آزمون (دقیقه)"
        min={1}
        max={480}
        helperText="مثلاً ۹۰ دقیقه"
      />
      <FormNumberField
        name="passing_score"
        control={control}
        label="حداقل درصد قبولی"
        min={0}
        max={100}
      />
    </Stack>
  );
}

export const Default: Story = {
  render: () => <NumberFieldDemo />,
};

export const WithValues: Story = {
  render: () => (
    <NumberFieldDemo defaults={{ duration_minutes: 90, passing_score: 50 }} />
  ),
};

export const SingleField: Story = {
  render: function Single() {
    const { control } = useForm<{ scale_max: number | null }>({
      defaultValues: { scale_max: 20 },
    });
    return (
      <Box sx={{ maxWidth: 280 }}>
        <FormNumberField
          name="scale_max"
          control={control}
          label="حداکثر نمره"
          min={1}
          max={100}
          required
        />
      </Box>
    );
  },
};
