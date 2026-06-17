import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Box } from "@mui/material";
import TeacherAnswerKeySheet from "./TeacherAnswerKeySheet";
import { SAMPLE_PRINT_EXAM } from "@/lib/exam-print/sample-exam";

const meta: Meta<typeof TeacherAnswerKeySheet> = {
  title: "سوالات/چاپ — TeacherAnswerKeySheet",
  component: TeacherAnswerKeySheet,
  decorators: [
    (Story) => (
      <Box dir="rtl" lang="fa" sx={{ maxWidth: 480, p: 2, bgcolor: "grey.100" }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TeacherAnswerKeySheet>;

export const SampleExam: Story = {
  args: { exam: SAMPLE_PRINT_EXAM },
};
