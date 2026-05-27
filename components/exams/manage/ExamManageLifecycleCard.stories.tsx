import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ExamWithParticipants } from '@/services/exams/ExamService';
import { ExamManageLifecycleCard } from './ExamManageLifecycleCard';

const baseExam: ExamWithParticipants = {
  id: 1,
  title: 'نمونه',
  type: 'online',
  meta: {},
  partner_id: null,
  status: 'published',
  is_active: true,
  published_at: null,
  registration_link: null,
  exam_link: null,
  created_by: 1,
  questions_count: 10,
  participants_count: 5,
  participants: [],
  created_at: '',
  updated_at: '',
};

const meta: Meta<typeof ExamManageLifecycleCard> = {
  title: 'آزمون/مدیریت — چرخه انتشار',
  component: ExamManageLifecycleCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ExamManageLifecycleCard>;

export const PublishedActive: Story = {
  args: { exam: baseExam },
};

export const DraftNoQuestions: Story = {
  args: {
    exam: {
      ...baseExam,
      status: 'draft',
      is_active: false,
      questions_count: 0,
    },
  },
};
