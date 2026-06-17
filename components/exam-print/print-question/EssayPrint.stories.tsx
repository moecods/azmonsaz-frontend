import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Box } from "@mui/material";
import EssayPrint from "./EssayPrint";
import type { QuestionPrintSettings } from "@/lib/question-types/print-settings";

const meta: Meta<typeof EssayPrint> = {
  title: "سوالات/چاپ — EssayPrint",
  component: EssayPrint,
  decorators: [
    (Story) => (
      <Box dir="rtl" lang="fa" sx={{ maxWidth: 560, p: 2, bgcolor: "#fff" }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EssayPrint>;

const baseSettings: QuestionPrintSettings = {
  answerLines: 8,
  answerLineStyle: "solid",
  answerLineSpacing: "normal",
  showAnswerLines: true,
};

export const SolidLines: Story = {
  args: { settings: baseSettings },
};

export const DottedLines: Story = {
  args: {
    settings: { ...baseSettings, answerLineStyle: "dotted", answerLines: 6 },
  },
};

export const GridLines: Story = {
  args: {
    settings: { ...baseSettings, answerLineStyle: "grid", answerLines: 5 },
  },
};

export const BlankBox: Story = {
  args: {
    settings: { ...baseSettings, answerLineStyle: "none", showAnswerLines: false, answerLines: 4 },
  },
};

export const WideSpacing: Story = {
  args: {
    settings: { ...baseSettings, answerLineSpacing: "wide", answerLines: 4 },
  },
};

export const CompactSpacing: Story = {
  args: {
    settings: { ...baseSettings, answerLineSpacing: "compact", answerLines: 10 },
  },
};
