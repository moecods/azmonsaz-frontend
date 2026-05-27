"use client";

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Box } from '@mui/material';
import { ExamNotificationComposer } from './ExamNotificationComposer';
import type { ParticipantOption } from '@/components/exams/ParticipantSelector';

const mockParticipants: ParticipantOption[] = [
  { id: 1, name: 'علی محمدی', phone_number: '09121234567' },
  { id: 2, name: 'زهرا حسینی', email: 'zahra@example.com' },
  { id: 3, name: 'رضا کریمی', phone_number: '09129876543' },
];

const meta: Meta<typeof ExamNotificationComposer> = {
  title: 'آزمون/اعلان — ExamNotificationComposer',
  component: ExamNotificationComposer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'فرم ارسال اعلان به شرکت‌کنندگان — فقط برای آزمون منتشرشده.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ExamNotificationComposer>;

function ComposerDemo({
  isPublished = true,
  isPending = false,
  isError = false,
}: {
  isPublished?: boolean;
  isPending?: boolean;
  isError?: boolean;
}) {
  const [message, setMessage] = useState('');
  const [selection, setSelection] = useState<number[] | 'all'>('all');

  return (
    <Box sx={{ maxWidth: 640 }}>
      <ExamNotificationComposer
        message={message}
        onMessageChange={setMessage}
        recipientSelection={selection}
        onRecipientChange={setSelection}
        participants={mockParticipants}
        isPublished={isPublished}
        isPending={isPending}
        isError={isError}
        errorMessage={isError ? 'ارسال اعلان ناموفق بود.' : undefined}
        onSend={fn()}
        onResetError={fn()}
      />
    </Box>
  );
}

export const DraftExam: Story = {
  render: () => <ComposerDemo isPublished={false} />,
};

export const ReadyToSend: Story = {
  render: function ReadyDemo() {
    const [message, setMessage] = useState('یادآوری: آزمون فردا ساعت ۸:۳۰ برگزار می‌شود.');
    const [selection, setSelection] = useState<number[] | 'all'>('all');
    return (
      <Box sx={{ maxWidth: 640 }}>
        <ExamNotificationComposer
          message={message}
          onMessageChange={setMessage}
          recipientSelection={selection}
          onRecipientChange={setSelection}
          participants={mockParticipants}
          isPublished
          isPending={false}
          isError={false}
          onSend={fn()}
          onResetError={fn()}
        />
      </Box>
    );
  },
};

export const Sending: Story = {
  render: () => <ComposerDemo isPending />,
};

export const WithError: Story = {
  render: () => <ComposerDemo isError />,
};
