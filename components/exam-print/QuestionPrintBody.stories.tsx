import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Box } from "@mui/material";
import QuestionPrintBody from "./QuestionPrintBody";
import {
  mockFillBlank,
  mockMatching,
  mockMultipleChoice,
  mockOrdering,
  mockShortAnswer,
  mockEssay,
} from "@/components/questions/__storybook__/fixtures";
import type { Question } from "@/types";

const asSource = (q: Question) => q as unknown as Record<string, unknown>;

const meta: Meta<typeof QuestionPrintBody> = {
  title: "سوالات/چاپ — QuestionPrintBody",
  component: QuestionPrintBody,
  decorators: [
    (Story) => (
      <Box dir="rtl" lang="fa" sx={{ maxWidth: 640, p: 2 }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof QuestionPrintBody>;

export const MultipleChoice: Story = {
  args: { source: asSource(mockMultipleChoice), questionId: mockMultipleChoice.id },
};

export const Matching: Story = {
  args: { source: asSource(mockMatching), questionId: mockMatching.id },
};

export const Ordering: Story = {
  args: { source: asSource(mockOrdering), questionId: mockOrdering.id },
};

export const FillInBlank: Story = {
  args: { source: asSource(mockFillBlank), questionId: mockFillBlank.id },
};

export const ShortAnswer: Story = {
  args: { source: asSource(mockShortAnswer), questionId: mockShortAnswer.id },
};

export const Essay: Story = {
  args: { source: asSource(mockEssay), questionId: mockEssay.id },
};

export const FormalVariant: Story = {
  args: { source: asSource(mockMatching), questionId: mockMatching.id, variant: "formal" },
};

export const PlayfulVariant: Story = {
  args: { source: asSource(mockOrdering), questionId: mockOrdering.id, variant: "playful" },
};
