"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Stack } from "@mui/material";
import { GroupPickCard } from "./GroupPickCard";

const sampleGroup = {
  id: 1,
  name: "کلاس دهم الف",
  description: "ریاضی و فیزیک — نیمسال اول",
  users_count: 32,
  avatar_url: null,
};

const meta: Meta<typeof GroupPickCard> = {
  title: "آزمون/شرکت‌کنندگان — GroupPickCard",
  component: GroupPickCard,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "کارت انتخاب یا نمایش گروه در تب افزودن شرکت‌کننده با گروه.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof GroupPickCard>;

export const Selectable: Story = {
  render: () => (
    <Stack spacing={1.5} sx={{ maxWidth: 320 }}>
      <GroupPickCard group={sampleGroup} variant="select" onSelect={fn()} />
      <GroupPickCard group={sampleGroup} variant="select" selected onSelect={fn()} />
    </Stack>
  ),
};

export const Attached: Story = {
  render: () => (
    <Stack spacing={1.5} sx={{ maxWidth: 320 }}>
      <GroupPickCard group={sampleGroup} variant="attached" onRemove={fn()} />
    </Stack>
  ),
};

export const Compact: Story = {
  render: () => (
    <Stack spacing={1.5} sx={{ maxWidth: 280 }}>
      <GroupPickCard group={sampleGroup} variant="select" compact onSelect={fn()} />
      <GroupPickCard group={sampleGroup} variant="attached" compact onRemove={fn()} />
    </Stack>
  ),
};
