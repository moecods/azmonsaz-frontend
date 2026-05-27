"use client";

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent } from 'storybook/test';
import { Stack, Typography, Box } from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import PrintIcon from '@mui/icons-material/Print';
import TitleIcon from '@mui/icons-material/Title';
import { FormStepSection, SelectableOptionCard } from './form-step-ui';

const meta: Meta = {
  title: 'آزمون/ویزارد — بخش مرحله',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'کارت بخش و گزینه انتخابی در فرم چندمرحله‌ای ساخت آزمون.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

export const Section: StoryObj = {
  tags: ['visual'],
  render: () => (
    <Box sx={{ maxWidth: 520 }}>
      <FormStepSection
        title="مشخصات آزمون"
        description="عنوان و نحوه برگزاری"
        icon={<TitleIcon fontSize="small" />}
      >
        <Typography variant="body2" color="text.secondary">
          محتوای فرم این بخش اینجا قرار می‌گیرد.
        </Typography>
      </FormStepSection>
    </Box>
  ),
};

export const SelectableOptions: StoryObj = {
  tags: ['autodocs', 'test'],
  render: function OptionsDemo() {
    const [type, setType] = useState<'online' | 'offline'>('online');
    return (
      <Stack spacing={1.5} sx={{ maxWidth: 480 }}>
        <SelectableOptionCard
          selected={type === 'online'}
          onClick={() => setType('online')}
          title="آنلاین"
          description="شرکت از طریق پلتفرم"
          icon={<ComputerIcon />}
        />
        <SelectableOptionCard
          selected={type === 'offline'}
          onClick={() => setType('offline')}
          title="آفلاین / چاپی"
          description="برگه یا حضوری"
          icon={<PrintIcon />}
        />
        <Typography variant="caption" color="text.secondary" data-testid="selected-type">
          انتخاب: {type === 'online' ? 'آنلاین' : 'آفلاین'}
        </Typography>
      </Stack>
    );
  },
  play: async ({ canvas, userEvent: ue }) => {
    await ue.click(canvas.getByRole('button', { name: /آفلاین \/ چاپی/ }));
    await expect(canvas.getByTestId('selected-type')).toHaveTextContent('انتخاب: آفلاین');
  },
};
