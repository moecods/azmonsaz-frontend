import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import type { ExamCapabilities, ExamWithParticipants } from '@/services/exams/ExamService';
import { ExamManageHero } from './ExamManageHero';

const mockExam: ExamWithParticipants = {
  id: 42,
  title: 'آزمون ریاضی پایه دهم — نوبت اول',
  type: 'online',
  meta: {
    schedule_type: 'fixed_window',
    exam_date: '2026-06-15',
    start_time: '08:30',
    end_time: '10:30',
    duration_minutes: 120,
  },
  partner_id: null,
  status: 'published',
  is_active: true,
  published_at: '2026-05-01T00:00:00.000Z',
  registration_link: 'https://example.com/register',
  exam_link: 'https://example.com/exam',
  created_by: 1,
  questions_count: 25,
  participants_count: 48,
  participants: [],
  created_at: '',
  updated_at: '',
};

const fullCaps: ExamCapabilities = {
  can_manage_schedule: true,
  can_manage_content: true,
  can_grade: true,
  can_manage_participants: true,
  can_publish: true,
  can_delete: true,
  can_activate: true,
  can_deactivate: true,
  can_release_results: true,
  can_view_reports: true,
};

const meta: Meta<typeof ExamManageHero> = {
  title: 'آزمون/مدیریت — هدر',
  component: ExamManageHero,
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/exams/42' },
    },
    docs: {
      description: {
        component: 'هدر فشرده صفحه مدیریت: عنوان، وضعیت، زمان‌بندی و دکمه‌های عملیات.',
      },
    },
  },
  tags: ['autodocs', 'visual'],
  args: {
    capabilities: fullCaps,
    onEdit: fn(),
    onQuestions: fn(),
    onGrading: fn(),
    onOpenActionsMenu: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ExamManageHero>;

export const Default: Story = {
  tags: ['visual'],
  args: {
    exam: mockExam,
  },
};

export const DraftExam: Story = {
  args: {
    exam: {
      ...mockExam,
      title: 'آزمون پیش‌نویس — فیزیک',
      status: 'draft',
      questions_count: 0,
      participants_count: 0,
      meta: { schedule_type: 'none' },
    },
  },
};
