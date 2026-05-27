import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ExamLiveParticipantRow } from '@/services/exams/ExamReportService';
import { ExamLiveMonitor } from './ExamLiveMonitor';

const rows: ExamLiveParticipantRow[] = [
  {
    participant_id: 1,
    user_id: 10,
    user_name: 'علی رضایی',
    phone_number: '09121234567',
    status: 'started',
    answered_count: 8,
    total_questions: 20,
    progress_percent: 40,
    current_question: { exam_question_id: 3, order: 9, title: 'معادله درجه دوم' },
    last_activity_at: new Date().toISOString(),
    started_at: new Date().toISOString(),
    remaining_seconds: 2400,
  },
  {
    participant_id: 2,
    user_id: 11,
    user_name: 'مریم احمدی',
    phone_number: null,
    status: 'registered',
    answered_count: 0,
    total_questions: 20,
    progress_percent: 0,
    current_question: null,
    last_activity_at: null,
    started_at: null,
    remaining_seconds: null,
  },
];

const meta: Meta<typeof ExamLiveMonitor> = {
  title: 'آزمون/گزارش — پایش زنده',
  component: ExamLiveMonitor,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ExamLiveMonitor>;

export const Default: Story = {
  args: {
    rows,
    examId: 42,
    canGrade: true,
  },
};
