"use client";

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { Stack, Box } from '@mui/material';
import { PersianDatePicker } from './PersianDatePicker';
import { PersianTimePicker } from './PersianTimePicker';
import { PersianDateTimePicker } from './PersianDateTimePicker';

const meta: Meta = {
  title: 'آزمون/انتخابگر تاریخ و زمان',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'انتخابگرهای شمسی برای زمان‌بندی آزمون. تاریخ به میلادی (YYYY-MM-DD) و datetime به ISO ذخیره می‌شود.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

export const DateOnly: StoryObj = {
  render: function DateDemo() {
    const [value, setValue] = useState<string | null>('2026-06-15');
    return (
      <Box sx={{ maxWidth: 360 }}>
        <PersianDatePicker
          label="تاریخ برگزاری"
          value={value}
          onChange={setValue}
        />
      </Box>
    );
  },
};

export const InteractionOpenCalendar: StoryObj = {
  tags: ['test'],
  render: function DateInteraction() {
    const [value, setValue] = useState<string | null>(null);
    return (
      <Box sx={{ maxWidth: 360 }}>
        <PersianDatePicker
          label="تاریخ برگزاری"
          value={value}
          onChange={setValue}
        />
      </Box>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // برچسب Typography است، نه <label htmlFor> — ورودی textbox است
    const input = canvas.getByRole('textbox');
    await userEvent.click(input);
    await waitFor(() => {
      expect(document.querySelector('.rmdp-wrapper')).toBeTruthy();
    });
  },
};

export const DateWithError: StoryObj = {
  render: function DateError() {
    const [value, setValue] = useState<string | null>(null);
    return (
      <Box sx={{ maxWidth: 360 }}>
        <PersianDatePicker
          label="تاریخ برگزاری"
          value={value}
          onChange={setValue}
          error
          errorMessage="تاریخ برگزاری الزامی است."
        />
      </Box>
    );
  },
};

export const TimeOnly: StoryObj = {
  render: function TimeDemo() {
    const [value, setValue] = useState<string | null>('09:00');
    return (
      <Box sx={{ maxWidth: 360 }}>
        <PersianTimePicker
          label="ساعت شروع"
          value={value}
          onChange={setValue}
        />
      </Box>
    );
  },
};

export const DateTime: StoryObj = {
  render: function DateTimeDemo() {
    const [value, setValue] = useState<string | null>(null);
    return (
      <Box sx={{ maxWidth: 360 }}>
        <PersianDateTimePicker
          label="مهلت ثبت‌نام"
          value={value}
          onChange={setValue}
          error={!value}
          errorMessage={!value ? 'مهلت ثبت‌نام را مشخص کنید.' : undefined}
        />
      </Box>
    );
  },
};

export const SchedulingRow: StoryObj = {
  render: function SchedulingDemo() {
    const [examDate, setExamDate] = useState<string | null>('2026-06-15');
    const [startTime, setStartTime] = useState<string | null>('08:30');
    const [endTime, setEndTime] = useState<string | null>('10:30');

    return (
      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        <PersianDatePicker
          label="تاریخ برگزاری"
          value={examDate}
          onChange={setExamDate}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <PersianTimePicker
            label="ساعت شروع"
            value={startTime}
            onChange={setStartTime}
          />
          <PersianTimePicker
            label="ساعت پایان"
            value={endTime}
            onChange={setEndTime}
          />
        </Stack>
      </Stack>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'ترکیب معمول در مرحله زمان‌بندی ویزارد ساخت آزمون.',
      },
    },
  },
};
