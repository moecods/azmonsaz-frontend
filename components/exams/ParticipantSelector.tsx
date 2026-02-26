"use client";

import { useState } from 'react';
import {
  Box,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';

export interface ParticipantOption {
  id: number;
  name: string;
  phone_number?: string | null;
  email?: string | null;
}

interface ParticipantSelectorProps {
  participants: ParticipantOption[];
  selectedIds: number[] | 'all';
  onSelectionChange: (selected: number[] | 'all') => void;
  disabled?: boolean;
}

export default function ParticipantSelector({
  participants,
  selectedIds,
  onSelectionChange,
  disabled = false,
}: ParticipantSelectorProps) {
  const handleAllChange = (checked: boolean) => {
    onSelectionChange(checked ? 'all' : []);
  };

  const handleParticipantChange = (id: number, checked: boolean) => {
    if (selectedIds === 'all') {
      if (checked) return; // already all
      onSelectionChange(participants.filter((p) => p.id !== id).map((p) => p.id));
      return;
    }
    if (checked) {
      const next = [...selectedIds, id];
      onSelectionChange(next.length === participants.length ? 'all' : next);
    } else {
      onSelectionChange(selectedIds.filter((x) => x !== id));
    }
  };

  const isAllSelected = selectedIds === 'all' || selectedIds.length === participants.length;
  const isParticipantSelected = (id: number) =>
    selectedIds === 'all' || selectedIds.includes(id);

  return (
    <Box>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={isAllSelected}
              indeterminate={selectedIds !== 'all' && selectedIds.length > 0 && selectedIds.length < participants.length}
              onChange={(e) => handleAllChange(e.target.checked)}
              disabled={disabled || participants.length === 0}
            />
          }
          label="همه شرکت‌کنندگان"
        />
      </FormGroup>
      {participants.length > 0 && (
        <Paper variant="outlined" sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
          <List dense>
            {participants.map((p) => (
              <ListItem key={p.id} disablePadding>
                <ListItemButton
                  onClick={() => handleParticipantChange(p.id, !isParticipantSelected(p.id))}
                  disabled={disabled}
                  sx={{ py: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox
                      edge="start"
                      checked={isParticipantSelected(p.id)}
                      tabIndex={-1}
                      disableRipple
                      disabled={disabled}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={p.name}
                    secondary={p.phone_number || p.email || undefined}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      {participants.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          شرکت‌کننده‌ای وجود ندارد
        </Typography>
      )}
    </Box>
  );
}
