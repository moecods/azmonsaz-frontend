"use client";

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { QuestionBankFiltersPanel } from './QuestionBankFiltersPanel';

const meta: Meta<typeof QuestionBankFiltersPanel> = {
  title: 'سوالات/بانک — QuestionBankFiltersPanel',
  component: QuestionBankFiltersPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'کارت فیلتر sidebar در دسکتاپ؛ زیر lg همان محتوا داخل Accordion (پیش‌فرض بسته).',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof QuestionBankFiltersPanel>;

export const Default: Story = {
  render: () => (
    <Stack sx={{ maxWidth: 280 }}>
      <QuestionBankFiltersPanel title="فیلتر سوالات" collapsibleOnMobile={false}>
        <TextField
          fullWidth
          size="small"
          placeholder="جستجو…"
          InputProps={{
            startAdornment: <SearchIcon sx={{ me: 1, color: 'text.secondary', fontSize: 20 }} />,
          }}
        />
        <FormControl size="small" fullWidth>
          <InputLabel>سطح سختی</InputLabel>
          <Select label="سطح سختی" defaultValue="">
            <MenuItem value="">همه</MenuItem>
            <MenuItem value="easy">آسان</MenuItem>
            <MenuItem value="medium">متوسط</MenuItem>
            <MenuItem value="hard">سخت</MenuItem>
          </Select>
        </FormControl>
        <Chip size="small" variant="outlined" label="۱۲ از ۴۸ سوال" />
      </QuestionBankFiltersPanel>
    </Stack>
  ),
};

export const MobileAccordion: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile2' },
  },
  render: () => (
    <QuestionBankFiltersPanel title="فیلتر آزمون‌ها" defaultExpanded>
      <TextField fullWidth size="small" placeholder="جستجو در عنوان آزمون…" />
      <FormControl size="small" fullWidth>
        <InputLabel>وضعیت</InputLabel>
        <Select label="وضعیت" defaultValue="all">
          <MenuItem value="all">همه</MenuItem>
          <MenuItem value="published">منتشرشده</MenuItem>
        </Select>
      </FormControl>
    </QuestionBankFiltersPanel>
  ),
};

export const WithProgress: Story = {
  render: () => (
    <Stack sx={{ maxWidth: 280 }}>
      <QuestionBankFiltersPanel
        title="فیلتر سوالات"
        collapsibleOnMobile={false}
        loadedCount={120}
        totalCount={480}
        isRefetching
      >
        <TextField fullWidth size="small" placeholder="جستجو…" />
      </QuestionBankFiltersPanel>
    </Stack>
  ),
};
