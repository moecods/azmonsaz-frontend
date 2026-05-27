"use client";

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Box } from '@mui/material';
import { ParticipantAddSection } from './ParticipantAddSection';
import type { ParticipantAddMethod } from './participant-ui-shared';

const mockGroups = [
  { id: 1, name: 'کلاس دهم الف', users_count: 32, description: 'ریاضی' },
  { id: 2, name: 'کلاس یازدهم', users_count: 28, description: 'فیزیک' },
  { id: 3, name: 'کلاس دوازدهم', users_count: 24 },
];

const mockSearchResults = [
  { id: 10, name: 'علی رضایی', phone_number: '09121234567' },
  { id: 11, name: 'مریم احمدی', phone_number: '09129876543' },
];

function SectionShell({ initialMethod = 'groups' }: { initialMethod?: ParticipantAddMethod }) {
  const [method, setMethod] = useState<ParticipantAddMethod>(initialMethod);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [nationalIds, setNationalIds] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleGroup = (id: number) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleUser = (id: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <Box sx={{ maxWidth: 480 }}>
      <ParticipantAddSection
        method={method}
        onMethodChange={setMethod}
        layout="drawer"
        registrationLink="https://example.com/register/abc"
        examLink="https://example.com/exam/abc"
        onCopyRegistration={fn()}
        onCopyExam={fn()}
        availableGroups={mockGroups}
        examGroupIds={new Set([1])}
        selectedGroupIds={selectedGroupIds}
        onToggleGroup={toggleGroup}
        onAddGroups={fn()}
        onRemoveGroup={fn()}
        onCreateGroup={fn()}
        isAddingGroups={false}
        isRemovingGroup={false}
        phoneNumbers={phoneNumbers}
        onPhoneChange={setPhoneNumbers}
        onAddByPhone={fn()}
        isAddingPhone={false}
        nationalIds={nationalIds}
        onNationalIdsChange={setNationalIds}
        onAddByNationalId={fn()}
        isAddingNationalId={false}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={mockSearchResults}
        isSearching={false}
        selectedUserIds={selectedUserIds}
        existingParticipantIds={new Set<number>([10])}
        onToggleUser={toggleUser}
        onAddSelected={fn()}
        isAddingSelected={false}
      />
    </Box>
  );
}

const meta: Meta<typeof ParticipantAddSection> = {
  title: 'آزمون/شرکت‌کنندگان — ParticipantAddSection',
  component: ParticipantAddSection,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'محتوای Drawer افزودن شرکت‌کننده — همه state از parent کنترل می‌شود.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ParticipantAddSection>;

export const GroupsTab: Story = {
  render: () => <SectionShell initialMethod="groups" />,
};

export const SearchTab: Story = {
  render: () => <SectionShell initialMethod="search" />,
};

export const LinksTab: Story = {
  render: () => <SectionShell initialMethod="links" />,
};
