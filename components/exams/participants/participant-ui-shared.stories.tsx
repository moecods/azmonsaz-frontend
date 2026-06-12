import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box, Button, Stack, Typography } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import {
  SectionCard,
  ManageSectionHeader,
  ContentPanel,
  ParticipantStatusBadge,
  ParticipantNameCell,
  ScoreCells,
} from './participant-ui-shared';
import type { UserParticipant } from '@/components/exams/ParticipantManagement.types';

const meta: Meta = {
  title: 'آزمون/شرکت‌کنندگان — UI',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'الگوهای UI مشترک تب شرکت‌کنندگان و اعلانات.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

export const ManageSectionFlat: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 560 }}>
      <ManageSectionHeader
        title="شرکت‌کنندگان"
        description="۱۲ نفر"
        action={
          <Button size="small" variant="contained">
            افزودن
          </Button>
        }
      />
      <ContentPanel>
        <Typography variant="body2" color="text.secondary">
          محتوای لیست یا جدول — بدون header/body جدا.
        </Typography>
      </ContentPanel>
    </Box>
  ),
};

export const SectionCardDefault: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 560 }}>
      <SectionCard
        title="افزودن شرکت‌کننده"
        icon={<GroupIcon color="primary" fontSize="small" />}
        action={
          <Button size="small" variant="contained">
            افزودن
          </Button>
        }
      >
        <Typography variant="body2" color="text.secondary">
          از گروه، جستجو یا لینک دعوت استفاده کنید.
        </Typography>
      </SectionCard>
    </Box>
  ),
};

function makeParticipant(overrides: Partial<UserParticipant>): UserParticipant {
  return {
    id: 1,
    user: null,
    group: null,
    status: 'registered',
    score: null,
    total_points: null,
    passed: false,
    started_at: null,
    completed_at: null,
    ...overrides,
  };
}

export const StatusBadges: StoryObj = {
  render: () => (
    <Stack direction="row" flexWrap="wrap" gap={1}>
      <ParticipantStatusBadge
        participant={makeParticipant({
          completed_at: '2026-01-01',
          passed: true,
          score: 18,
          total_points: 20,
        })}
      />
      <ParticipantStatusBadge
        participant={makeParticipant({
          completed_at: '2026-01-01',
          passed: false,
          score: 8,
          total_points: 20,
        })}
      />
      <ParticipantStatusBadge
        participant={makeParticipant({
          started_at: '2026-01-01',
          status: 'in_progress',
        })}
      />
      <ParticipantStatusBadge
        participant={makeParticipant({ status: 'absent' })}
      />
      <ParticipantStatusBadge participant={makeParticipant({})} />
    </Stack>
  ),
};

export const NameCell: StoryObj = {
  render: () => (
    <ParticipantNameCell
      user={{
        id: 1,
        name: 'سارا نوری',
        email: 'sara@example.com',
        national_id: '0012345678',
      }}
    />
  ),
};

export const ScoreCellsNumeric: StoryObj = {
  render: () => (
    <ScoreCells
      isDescriptive={false}
      participant={makeParticipant({
        score: 17,
        total_points: 20,
        completed_at: '2026-01-01',
        passed: true,
      })}
    />
  ),
};

export const ScoreCellsDescriptive: StoryObj = {
  render: () => (
    <Stack spacing={0.5} sx={{ maxWidth: 200 }}>
      <Typography variant="caption" color="text.secondary">
        نمره عددی + برچسب توصیفی
      </Typography>
      <Stack direction="row" spacing={2}>
        <ScoreCells
          isDescriptive
          participant={makeParticipant({
            score: 18,
            total_points: 20,
            scaled_score: 18,
            outcome_label: 'خیلی خوب',
            completed_at: '2026-01-01',
            passed: true,
          })}
        />
      </Stack>
    </Stack>
  ),
};
