"use client";

import { useEffect, useRef } from 'react';
import { Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import type { GraderNotePayload } from '@/services/exams/ExamService';
import { RichLabel } from '@/components/editor';
import { resolveMediaUrl } from '@/lib/resolve-media-url';
import { graderNoteNeedsAcknowledgment, hasGraderNoteContent } from '@/lib/grader-notes';

export type GraderNoteDisplayValue = GraderNotePayload;

interface GraderNoteDisplayProps {
  title?: string;
  note: GraderNoteDisplayValue | null | undefined;
  onMarkSeen?: () => void;
  onAcknowledge?: () => void;
  markingSeen?: boolean;
  acknowledging?: boolean;
}

export default function GraderNoteDisplay({
  title = 'یادداشت معلم',
  note,
  onMarkSeen,
  onAcknowledge,
  markingSeen = false,
  acknowledging = false,
}: GraderNoteDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const seenReportedRef = useRef(false);

  useEffect(() => {
    seenReportedRef.current = false;
  }, [note?.saved_at, note?.text, note?.audio_media_id]);

  useEffect(() => {
    if (!hasGraderNoteContent(note) || !onMarkSeen) return;
    if (note?.engagement?.is_seen) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.35);
        if (visible && !seenReportedRef.current && !note?.engagement?.is_seen) {
          seenReportedRef.current = true;
          onMarkSeen();
        }
      },
      { threshold: [0.35] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [note, onMarkSeen]);

  if (!hasGraderNoteContent(note)) {
    return null;
  }

  const audioSrc = resolveMediaUrl(note?.audio_url);
  const needsAck = graderNoteNeedsAcknowledgment(note);
  const isUnseen = !note?.engagement?.is_seen;
  const noteText = note?.text?.trim() ?? '';

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        maxWidth: '100%',
        p: { xs: 1.25, md: 1.5, lg: 2 },
        px: { md: 2.5 },
        borderRadius: 1,
        bgcolor: needsAck ? 'warning.50' : 'action.hover',
        border: '1px solid',
        borderColor: needsAck ? 'warning.light' : 'divider',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 1.5, md: 2 }}
        alignItems={{ md: 'flex-start' }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ flexShrink: 0, minWidth: { md: 200 } }}
        >
          <RecordVoiceOverIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.4 }}>
            {title}
          </Typography>
          {isUnseen && <Chip label="جدید" size="small" color="info" variant="filled" />}
          {needsAck && (
            <Chip label="نیاز به تأیید" size="small" color="warning" variant="outlined" />
          )}
          {note?.engagement?.requires_acknowledgment && note?.engagement?.is_acknowledged && (
            <Chip
              label="تأیید شده"
              size="small"
              color="success"
              variant="outlined"
              icon={<CheckCircleOutlineIcon />}
            />
          )}
        </Stack>

        <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          {noteText ? (
            <RichLabel
              html={noteText}
              fontSize="0.95rem"
              compact={false}
              fullContent
              sx={{ lineHeight: 1.75 }}
            />
          ) : null}
          {audioSrc ? (
            <audio controls src={audioSrc} style={{ width: '100%', maxWidth: 480 }} preload="metadata" />
          ) : note?.audio_media_id ? (
            <Typography variant="caption" color="text.secondary">
              فایل صوتی در دسترس نیست.
            </Typography>
          ) : null}
          {needsAck && onAcknowledge && (
            <Button
              variant="contained"
              color="warning"
              size="small"
              disabled={acknowledging}
              startIcon={
                acknowledging ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <CheckCircleOutlineIcon />
                )
              }
              onClick={onAcknowledge}
              sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
            >
              تأیید کردم — یادداشت را خواندم
            </Button>
          )}
          {markingSeen && isUnseen && (
            <Typography variant="caption" color="text.secondary">
              در حال ثبت مشاهده...
            </Typography>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
