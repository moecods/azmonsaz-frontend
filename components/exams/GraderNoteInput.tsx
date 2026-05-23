"use client";

import { useRef, useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { mediaService } from '@/services';
import { handleError } from '@/lib/error-handler';

export interface GraderNoteValue {
  text: string;
  audio_media_id: number | null;
  audio_url?: string | null;
  requires_acknowledgment?: boolean;
}

interface GraderNoteInputProps {
  label: string;
  value: GraderNoteValue;
  onChange: (value: GraderNoteValue) => void;
}

export default function GraderNoteInput({ label, value, onChange }: GraderNoteInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadAudio = async (file: Blob, filename: string) => {
    setUploading(true);
    try {
      const media = await mediaService.upload(file, {
        collection: 'grading_audio',
        filename,
      });
      onChange({
        ...value,
        audio_media_id: media.id,
        audio_url: media.url,
      });
    } catch (error) {
      handleError(error, { context: 'آپلود صوت یادداشت' });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadAudio(file, file.name);
    event.target.value = '';
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    recorder.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      await uploadAudio(blob, `grading-note-${Date.now()}.webm`);
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <TextField
        size="small"
        multiline
        minRows={2}
        placeholder="یادداشت متنی..."
        value={value.text}
        onChange={(e) => onChange({ ...value, text: e.target.value })}
        fullWidth
      />
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Button
          size="small"
          variant="outlined"
          startIcon={<UploadFileIcon />}
          disabled={uploading || recording}
          onClick={() => fileInputRef.current?.click()}
        >
          آپلود صوت
        </Button>
        {!recording ? (
          <Button
            size="small"
            variant="outlined"
            startIcon={<MicIcon />}
            disabled={uploading}
            onClick={() => void startRecording().catch(() => undefined)}
          >
            ضبط
          </Button>
        ) : (
          <Button size="small" color="error" variant="outlined" startIcon={<StopIcon />} onClick={stopRecording}>
            توقف ضبط
          </Button>
        )}
        {value.audio_media_id ? (
          <Button
            size="small"
            color="inherit"
            onClick={() => onChange({ ...value, audio_media_id: null, audio_url: null })}
          >
            حذف صوت
          </Button>
        ) : null}
      </Stack>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        hidden
        onChange={(e) => void handleFileChange(e)}
      />
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={Boolean(value.requires_acknowledgment)}
            onChange={(e) =>
              onChange({ ...value, requires_acknowledgment: e.target.checked })
            }
          />
        }
        label={
          <Typography variant="caption" color="text.secondary">
            دانش‌آموز باید با دکمه «تأیید کردم» مشاهده یادداشت را تأیید کند
          </Typography>
        }
      />
      {value.audio_url ? (
        <Box>
          <audio controls src={value.audio_url} style={{ width: '100%' }} />
        </Box>
      ) : null}
      {uploading ? (
        <Typography variant="caption" color="text.secondary">
          در حال آپلود...
        </Typography>
      ) : null}
    </Stack>
  );
}
