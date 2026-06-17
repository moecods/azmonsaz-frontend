"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button, Stack, Typography } from "@mui/material";
import { useConfirmDialog } from "./ConfirmDialog";

function ConfirmDemo() {
  const { confirm, dialog } = useConfirmDialog();
  const [result, setResult] = useState<string>("");

  return (
    <>
      <Stack spacing={2} alignItems="flex-start">
        <Button
          variant="contained"
          color="error"
          onClick={async () => {
            const ok = await confirm({
              title: "حذف کاربر",
              message: "آیا از حذف این کاربر اطمینان دارید؟",
              confirmLabel: "حذف",
              confirmColor: "error",
            });
            setResult(ok ? "تأیید شد" : "لغو شد");
          }}
        >
          نمایش تأیید
        </Button>
        {result ? (
          <Typography variant="body2" color="text.secondary">
            نتیجه: {result}
          </Typography>
        ) : null}
      </Stack>
      {dialog}
    </>
  );
}

const meta: Meta<typeof ConfirmDemo> = {
  title: "بازخورد/ConfirmDialog",
  component: ConfirmDemo,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ConfirmDemo>;

export const Default: Story = {
  render: () => <ConfirmDemo />,
};
