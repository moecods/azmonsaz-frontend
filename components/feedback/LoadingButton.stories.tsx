"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Stack } from "@mui/material";
import { LoadingButton } from "./LoadingButton";

const meta: Meta<typeof LoadingButton> = {
  title: "بازخورد/دکمه LoadingButton",
  component: LoadingButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LoadingButton>;

export const Default: Story = {
  args: {
    variant: "contained",
    children: "ذخیره",
  },
};

export const Loading: Story = {
  args: {
    variant: "contained",
    loading: true,
    loadingText: "در حال ذخیره...",
    children: "ذخیره",
  },
};

export const SuccessFlash: Story = {
  render: function SuccessFlashDemo() {
    const [loading, setLoading] = useState(false);
    return (
      <LoadingButton
        variant="contained"
        loading={loading}
        loadingText="در حال ذخیره..."
        successFlash="ذخیره شد"
        onClick={() => {
          setLoading(true);
          window.setTimeout(() => setLoading(false), 1200);
        }}
      >
        ذخیره
      </LoadingButton>
    );
  },
};

export const Variants: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <LoadingButton variant="contained" loading>
        contained
      </LoadingButton>
      <LoadingButton variant="outlined" loading loadingText="صبر کنید...">
        outlined
      </LoadingButton>
    </Stack>
  ),
};
