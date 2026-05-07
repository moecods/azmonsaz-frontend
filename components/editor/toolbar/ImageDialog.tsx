"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  LinearProgress,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import {
  ALLOWED_MIME,
  DEFAULT_LIMITS,
  ImageProcessingError,
  fileToDataUrl,
  loadHtmlImage,
  processImageFile,
  validateImageFile,
  type CropRect,
  type ProgressEvent,
} from '../lib/image-utils';
import { mediaService } from '@/services';
import { ImageCropper } from './ImageCropper';

const ACCEPT_ATTR = ALLOWED_MIME.join(',');

const STAGE_LABEL: Record<ProgressEvent['stage'], string> = {
  reading: 'در حال خواندن فایل…',
  decoding: 'در حال رمزگشایی تصویر…',
  cropping: 'اعمال برش…',
  compressing: 'فشرده‌سازی…',
  encoding: 'آماده‌سازی نهایی…',
  done: '',
};

/** Stage label shown while the processed blob is uploaded to the backend. */
const UPLOAD_LABEL = 'آپلود به سرور…';

export interface ImageDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (params: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  }) => void;
  /** When provided, the dialog opens in "edit/replace" mode for an existing image. */
  initial?: { src?: string; alt?: string } | null;
  /** When true, jumps straight into the crop UI on open (after a file is loaded). */
  startInCropMode?: boolean;
}

export function ImageDialog({
  open,
  onClose,
  onSubmit,
  initial,
  startInCropMode = false,
}: ImageDialogProps) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');

  /** Source preview to crop from (data URL — file already validated). */
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [sourceDims, setSourceDims] = useState<{ w: number; h: number } | null>(null);

  const [crop, setCrop] = useState<CropRect | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [compress, setCompress] = useState(true);

  const [stage, setStage] = useState<ProgressEvent | null>(null);
  /** 0..1 fraction while the blob is being uploaded. `null` when idle. */
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Reset state every time the dialog opens. */
  useEffect(() => {
    if (!open) return;
    setTab(initial?.src ? 'url' : 'upload');
    setUrl(initial?.src && /^https?:|^\//i.test(initial.src) ? initial.src : '');
    setAlt(initial?.alt ?? '');
    setSourceFile(null);
    setSourcePreview(null);
    setSourceDims(null);
    setCrop(null);
    setShowCrop(startInCropMode);
    setCompress(true);
    setStage(null);
    setUploadProgress(null);
    setError(null);
  }, [open, initial, startInCropMode]);

  /* Listen for paste events while the dialog is open so users can paste
   * a clipboard screenshot directly into the dialog. */
  useEffect(() => {
    if (!open) return;
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const it of Array.from(items)) {
        if (it.kind === 'file' && it.type.startsWith('image/')) {
          const f = it.getAsFile();
          if (f) {
            void handleFile(f);
            e.preventDefault();
            return;
          }
        }
      }
    };
    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onProgress = useCallback((p: ProgressEvent) => setStage(p), []);

  const handleFile = useCallback(async (file: File | undefined) => {
    setError(null);
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    try {
      setStage({ stage: 'reading' });
      const dataUrl = await fileToDataUrl(file);
      const img = await loadHtmlImage(dataUrl);
      setSourceFile(file);
      setSourcePreview(dataUrl);
      setSourceDims({ w: img.naturalWidth, h: img.naturalHeight });
      setCrop(null);
      setStage(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطای نامشخص در خواندن فایل');
      setStage(null);
    }
  }, []);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    void handleFile(file);
  };

  const handleSubmit = useCallback(async () => {
    setError(null);
    try {
      if (tab === 'url') {
        if (!url.trim()) return;
        onSubmit({ src: url.trim(), alt: alt.trim() || undefined });
        return;
      }
      if (!sourceFile) return;

      const result = await processImageFile(
        sourceFile,
        {
          crop: crop ?? undefined,
          limits: compress
            ? DEFAULT_LIMITS
            : { ...DEFAULT_LIMITS, maxWidth: 4096, maxHeight: 4096, quality: 0.95 },
        },
        onProgress,
      );

      // Upload the processed blob to the backend (no base64 in the document).
      setUploadProgress(0);
      const uploaded = await mediaService.upload(result.blob, {
        filename: result.filename,
        collection: 'editor',
        onProgress: setUploadProgress,
      });

      onSubmit({
        src: uploaded.url,
        alt: alt.trim() || undefined,
        width: uploaded.width ?? undefined,
        height: uploaded.height ?? undefined,
      });
    } catch (e) {
      const msg =
        e instanceof ImageProcessingError ? e.message :
        e instanceof Error ? e.message :
        'خطای نامشخص';
      setError(msg);
      setStage(null);
      setUploadProgress(null);
    }
  }, [tab, url, alt, sourceFile, crop, compress, onProgress, onSubmit]);

  const isUploading = uploadProgress !== null;
  const isProcessing = (stage !== null && stage.stage !== 'done') || isUploading;
  const hasUploadedImage = Boolean(sourcePreview);

  const canSubmit =
    !isProcessing &&
    (tab === 'url' ? Boolean(url.trim()) : hasUploadedImage);

  /** Compute output dimensions hint (informational). */
  const outputHint = useMemo(() => {
    if (!sourceDims) return null;
    const w = crop?.width ?? 1;
    const h = crop?.height ?? 1;
    const cw = Math.round(sourceDims.w * w);
    const ch = Math.round(sourceDims.h * h);
    return `${cw} × ${ch}`;
  }, [sourceDims, crop]);

  return (
    <Dialog open={open} onClose={isProcessing ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initial?.src ? 'جایگزینی تصویر' : 'افزودن تصویر'}
      </DialogTitle>
      <DialogContent>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 2 }}
          aria-label="منبع تصویر"
        >
          <Tab value="upload" label="آپلود" />
          <Tab value="url" label="آدرس URL" />
        </Tabs>

        <Stack spacing={2}>
          {tab === 'upload' ? (
            <>
              <Box onDragOver={handleDragOver} onDrop={handleDrop}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT_ATTR}
                  style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                  disabled={isProcessing}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ py: 4, borderStyle: 'dashed' }}
                >
                  {hasUploadedImage
                    ? 'انتخاب تصویر دیگر'
                    : 'انتخاب فایل، کشیدن و رها کردن، یا چسباندن از کلیپ‌بورد'}
                </Button>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: 'block' }}
                >
                  فرمت‌های مجاز: PNG, JPG, WEBP, GIF, SVG · حداکثر{' '}
                  {Math.round(DEFAULT_LIMITS.maxBytes / 1024 / 1024)} مگابایت
                </Typography>
              </Box>

              {hasUploadedImage && sourcePreview && sourceDims && (
                <>
                  {showCrop ? (
                    <ImageCropper
                      src={sourcePreview}
                      sourceWidth={sourceDims.w}
                      sourceHeight={sourceDims.h}
                      value={crop}
                      onChange={setCrop}
                    />
                  ) : (
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        textAlign: 'center',
                        bgcolor: 'action.hover',
                      }}
                    >
                      <Box
                        component="img"
                        src={sourcePreview}
                        alt="پیش‌نمایش"
                        sx={{ maxHeight: 240, maxWidth: '100%' }}
                      />
                    </Box>
                  )}

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                    rowGap={1}
                  >
                    <Tooltip title="حذف تصویر انتخاب‌شده">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSourceFile(null);
                          setSourcePreview(null);
                          setSourceDims(null);
                          setCrop(null);
                          setShowCrop(false);
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Box sx={{ flex: 1, minWidth: 0 }} />

                    {outputHint && (
                      <Typography variant="caption" color="text.secondary">
                        ابعاد خروجی: {outputHint}
                      </Typography>
                    )}
                  </Stack>

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={compress}
                        onChange={(e) => setCompress(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        فشرده‌سازی خودکار (پیشنهادی)
                      </Typography>
                    }
                  />
                </>
              )}
            </>
          ) : (
            <TextField
              autoFocus
              label="آدرس تصویر"
              placeholder="https://example.com/image.png"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              fullWidth
              inputProps={{ dir: 'ltr' }}
            />
          )}

          <TextField
            label="متن جایگزین (alt)"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            fullWidth
            helperText="برای دسترس‌پذیری و SEO. تصویر دکوراتیو را خالی بگذارید."
          />

          {isProcessing && (
            <Box>
              <LinearProgress
                variant={isUploading ? 'determinate' : 'indeterminate'}
                value={isUploading ? Math.round(uploadProgress! * 100) : undefined}
              />
              <Typography variant="caption" color="text.secondary">
                {isUploading
                  ? `${UPLOAD_LABEL} ${Math.round((uploadProgress ?? 0) * 100)}%`
                  : STAGE_LABEL[stage!.stage]}
              </Typography>
            </Box>
          )}

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isProcessing}>
          انصراف
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {initial?.src ? 'به‌روزرسانی' : 'درج تصویر'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
