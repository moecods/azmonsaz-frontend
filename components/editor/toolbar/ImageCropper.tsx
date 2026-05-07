"use client";

/**
 * Modern crop UI built on `react-easy-crop`.
 * Outputs a normalized `CropRect` (0..1 coordinates relative to the source
 * image) so consumers don't need to know about display scale.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import Cropper, { type Area } from 'react-easy-crop';

import type { CropRect } from '../lib/image-utils';

type AspectKey = 'free' | '1:1' | '4:3' | '16:9' | '3:4' | '9:16';

const ASPECTS: { key: AspectKey; label: string; ratio: number | undefined }[] = [
  { key: 'free', label: 'آزاد', ratio: undefined },
  { key: '1:1', label: '۱:۱', ratio: 1 },
  { key: '4:3', label: '۴:۳', ratio: 4 / 3 },
  { key: '16:9', label: '۱۶:۹', ratio: 16 / 9 },
  { key: '3:4', label: '۳:۴', ratio: 3 / 4 },
  { key: '9:16', label: '۹:۱۶', ratio: 9 / 16 },
];

export interface ImageCropperProps {
  src: string;
  /** Initial pixel dimensions of the source image (used to normalize the crop). */
  sourceWidth: number;
  sourceHeight: number;
  value?: CropRect | null;
  onChange: (rect: CropRect | null) => void;
}

export function ImageCropper({
  src,
  sourceWidth,
  sourceHeight,
  value,
  onChange,
}: ImageCropperProps) {
  const [aspect, setAspect] = useState<AspectKey>('free');
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const aspectRatio = ASPECTS.find((a) => a.key === aspect)?.ratio;

  // When the lock changes, re-center.
  useEffect(() => {
    setCrop({ x: 0, y: 0 });
  }, [aspect]);

  const handleCropComplete = useCallback(
    (_area: Area, areaPixels: Area) => {
      if (!sourceWidth || !sourceHeight) return;
      const normalized: CropRect = {
        x: clamp(areaPixels.x / sourceWidth, 0, 1),
        y: clamp(areaPixels.y / sourceHeight, 0, 1),
        width: clamp(areaPixels.width / sourceWidth, 0, 1),
        height: clamp(areaPixels.height / sourceHeight, 0, 1),
      };
      // Treat full-image crop as "no crop" so we don't waste a re-encode.
      const isFull =
        normalized.x < 0.001 &&
        normalized.y < 0.001 &&
        normalized.width > 0.999 &&
        normalized.height > 0.999;
      onChange(isFull ? null : normalized);
    },
    [sourceWidth, sourceHeight, onChange],
  );

  const initialPercents = value
    ? {
        x: value.x * 100,
        y: value.y * 100,
        width: value.width * 100,
        height: value.height * 100,
      }
    : undefined;

  return (
    <Stack spacing={1.5}>
      <Box
        dir="ltr"
        sx={{
          position: 'relative',
          width: '100%',
          height: 320,
          bgcolor: 'common.black',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio ?? sourceWidth / Math.max(1, sourceHeight)}
          showGrid
          restrictPosition
          minZoom={1}
          maxZoom={4}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
          initialCroppedAreaPercentages={initialPercents}
          objectFit="contain"
        />
      </Box>
    </Stack>
  );
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
