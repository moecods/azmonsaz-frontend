"use client";

import { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo, type RefObject } from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Checkbox,
  Paper,
  useMediaQuery,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  IconButton,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SettingsIcon from "@mui/icons-material/Settings";
import PreviewIcon from "@mui/icons-material/Preview";
import PeopleIcon from "@mui/icons-material/People";
import KeyIcon from "@mui/icons-material/Key";
import CloseIcon from "@mui/icons-material/Close";
import { useReactToPrint } from "react-to-print";
import ParticipantSelector, { type ParticipantOption } from "./exams/ParticipantSelector";
import SelectedTemplatePreview from "./exam-print/SelectedTemplatePreview";
import TemplatePickerDialog from "./exam-print/TemplatePickerDialog";
import PrintPreviewContent from "./exam-print/PrintPreviewContent";
import PrintPreviewZoomBar, { clampZoom } from "./exam-print/PrintPreviewZoomBar";
import QuestionPrintSettingsDrawer from "./questions/QuestionPrintSettingsDrawer";
import QuestionPrintSettingsPanel from "./questions/QuestionPrintSettingsPanel";
import { useUpdateExam, useUpdateExamQuestion } from "@/hooks/useExams";
import { useDebounce } from "@/hooks/useDebounce";
import { EXAM_TEMPLATES } from "@/lib/exam-print/template-registry";
import {
  mergeExamPrintSettings,
  mergeQuestionPrintSettings,
  resolveQuestionPrintSettings,
  type QuestionPrintSettings,
} from "@/lib/question-types/print-settings";
import {
  TEMPLATE_HEADER_FIELDS,
  resolveTemplateId,
  resolvePrintMode,
  type ExamForPrint,
  type ExamPrintMode,
  type ExamTemplateId,
  type PrintHeaderOverrides,
} from "@/lib/exam-print/types";

export type { PrintHeaderOverrides };
export { TEMPLATE_HEADER_FIELDS };

const PAGE_SIZES = [
  { value: "A4", label: "A4 (۲۱۰×۲۹۷ mm)", width: "210mm", height: "297mm" },
  { value: "A3", label: "A3 (۲۹۷×۴۲۰ mm)", width: "297mm", height: "420mm" },
  { value: "A5", label: "A5 (۱۴۸×۲۱۰ mm)", width: "148mm", height: "210mm" },
  { value: "Letter", label: "Letter (۲۱۶×۲۷۹ mm)", width: "8.5in", height: "11in" },
] as const;
type PageSizeValue = (typeof PAGE_SIZES)[number]["value"];

const ORIENTATIONS = [
  { value: "portrait", label: "عمودی (Portrait)" },
  { value: "landscape", label: "افقی (Landscape)" },
] as const;
type OrientationValue = (typeof ORIENTATIONS)[number]["value"];

const MARGIN_OPTIONS = [
  { value: "0", label: "بدون حاشیه" },
  { value: "5", label: "کم (۵ mm)" },
  { value: "10", label: "متوسط (۱۰ mm)" },
  { value: "15", label: "زیاد (۱۵ mm)" },
] as const;
type MarginValue = (typeof MARGIN_OPTIONS)[number]["value"];

const HEADER_KEY_TO_URL: Record<keyof PrintHeaderOverrides, string> = {
  schoolName: "school_name",
  className: "class",
  grade: "grade",
  studentCode: "student_code",
  courseName: "course",
  examDate: "exam_date",
  examTime: "exam_time",
  teacherName: "teacher_name",
  studentFirstName: "student_first_name",
  studentLastName: "student_last_name",
};

function getOrientationFromSearch(): OrientationValue {
  if (typeof window === "undefined") return "portrait";
  const o = new URLSearchParams(window.location.search).get("orientation");
  return o === "landscape" ? "landscape" : "portrait";
}

function getMarginFromSearch(): MarginValue {
  if (typeof window === "undefined") return "0";
  const m = new URLSearchParams(window.location.search).get("margin");
  return MARGIN_OPTIONS.some((s) => s.value === m) ? (m as MarginValue) : "0";
}

function getPageSizeFromSearch(): PageSizeValue {
  if (typeof window === "undefined") return "A4";
  const p = new URLSearchParams(window.location.search).get("page_size");
  return PAGE_SIZES.some((s) => s.value === p) ? (p as PageSizeValue) : "A4";
}

function applyPrintModeToUrl(mode: ExamPrintMode) {
  const url = new URL(window.location.href);
  if (mode === "answer_key") {
    url.searchParams.set("answer_key", "1");
  } else {
    url.searchParams.delete("answer_key");
    url.searchParams.delete("mode");
  }
  window.history.replaceState({}, "", url.toString());
}

function getHeaderFromSearch(): PrintHeaderOverrides {
  if (typeof window === "undefined") return {};
  const q = new URLSearchParams(window.location.search);
  const out: PrintHeaderOverrides = {};
  (Object.keys(HEADER_KEY_TO_URL) as (keyof PrintHeaderOverrides)[]).forEach((k) => {
    const v = q.get(HEADER_KEY_TO_URL[k]);
    if (v != null) out[k] = v;
  });
  return out;
}

function applyHeaderToUrl(header: PrintHeaderOverrides) {
  const url = new URL(window.location.href);
  Object.values(HEADER_KEY_TO_URL).forEach((param) => url.searchParams.delete(param));
  (Object.keys(HEADER_KEY_TO_URL) as (keyof PrintHeaderOverrides)[]).forEach((k) => {
    if (header[k]) url.searchParams.set(HEADER_KEY_TO_URL[k], header[k]!);
  });
  window.history.replaceState({}, "", url.toString());
}

export interface PrintParticipantOption {
  id: number;
  name: string;
  phone_number?: string | null;
  email?: string | null;
}

interface ExamPrintViewProps {
  exam: ExamForPrint;
  participants?: PrintParticipantOption[];
  template: string;
  pageSizeFromUrl?: string | null;
  orientationFromUrl?: string | null;
  marginFromUrl?: string | null;
  headerFromUrl?: PrintHeaderOverrides | null;
  answerKeyFromUrl?: string | null;
  printModeFromUrl?: string | null;
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const t = (fullName || "").trim();
  const i = t.indexOf(" ");
  if (i <= 0) return { firstName: t, lastName: "" };
  return { firstName: t.slice(0, i), lastName: t.slice(i + 1).trim() };
}

export default function ExamPrintView({
  exam,
  participants = [],
  template: initialTemplate,
  pageSizeFromUrl,
  orientationFromUrl,
  marginFromUrl,
  headerFromUrl,
  answerKeyFromUrl,
  printModeFromUrl,
}: ExamPrintViewProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const printRef = useRef<HTMLDivElement>(null);
  const previewViewportRef = useRef<HTMLDivElement>(null);
  const fullscreenViewportRef = useRef<HTMLDivElement>(null);
  const resolvedInitial = resolveTemplateId(initialTemplate);
  const [template, setTemplate] = useState<ExamTemplateId>(resolvedInitial);
  const initialPrintMode = resolvePrintMode(answerKeyFromUrl, printModeFromUrl);
  const [printMode, setPrintMode] = useState<ExamPrintMode>(initialPrintMode);
  const isAnswerKey = printMode === "answer_key";
  const participantOptions: ParticipantOption[] = participants.map((p) => ({
    id: p.id,
    name: p.name,
    phone_number: p.phone_number ?? null,
    email: p.email ?? null,
  }));
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<number[] | "all">([]);
  const [insertBlankBetweenBooklets, setInsertBlankBetweenBooklets] = useState(true);
  const initialHeader =
    headerFromUrl && typeof headerFromUrl === "object"
      ? { ...getHeaderFromSearch(), ...headerFromUrl }
      : getHeaderFromSearch();
  const [headerOverrides, setHeaderOverrides] = useState<PrintHeaderOverrides>(initialHeader);
  const initialPageSize: PageSizeValue = PAGE_SIZES.some((s) => s.value === pageSizeFromUrl)
    ? (pageSizeFromUrl as PageSizeValue)
    : getPageSizeFromSearch();
  const [pageSize, setPageSize] = useState<PageSizeValue>(initialPageSize);
  const initialOrientation: OrientationValue =
    orientationFromUrl === "landscape" ? "landscape" : getOrientationFromSearch();
  const [orientation, setOrientation] = useState<OrientationValue>(initialOrientation);
  const initialMargin: MarginValue = MARGIN_OPTIONS.some((s) => s.value === marginFromUrl)
    ? (marginFromUrl as MarginValue)
    : getMarginFromSearch();
  const marginDefaultForUrl = "0";
  const [margin, setMargin] = useState<MarginValue>(initialMargin);
  const marginNum = margin === "0" ? 0 : Number(margin);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const [examState, setExamState] = useState(exam);
  const [footerNote, setFooterNote] = useState("");
  const [printDrawerOpen, setPrintDrawerOpen] = useState(false);
  const [selectedQuestionNumber, setSelectedQuestionNumber] = useState<number | null>(null);
  const [printSettingsDraft, setPrintSettingsDraft] = useState<QuestionPrintSettings | null>(null);
  const [printTab, setPrintTab] = useState(0);

  const updateExamMutation = useUpdateExam();
  const updateExamQuestionMutation = useUpdateExamQuestion();
  const isOfflineExam = exam.type === "offline";
  const debouncedFooterNote = useDebounce(footerNote, 600);

  useEffect(() => {
    setExamState(exam);
    setFooterNote(mergeExamPrintSettings(exam.print_settings).footerNote ?? "");
  }, [exam]);

  useEffect(() => {
    if (!isOfflineExam) return;
    const saved = mergeExamPrintSettings(exam.print_settings).footerNote ?? "";
    if (debouncedFooterNote === saved) return;

    updateExamMutation.mutate(
      {
        id: exam.id,
        data: {
          print_settings: {
            ...mergeExamPrintSettings(examState.print_settings),
            footerNote: debouncedFooterNote.trim() || undefined,
          },
        },
      },
      {
        onSuccess: (data) => {
          const nextSettings =
            (data as { print_settings?: Record<string, unknown> }).print_settings ??
            examState.print_settings;
          setExamState((prev) => ({ ...prev, print_settings: nextSettings }));
        },
      }
    );
  }, [debouncedFooterNote, exam.id, exam.print_settings, isOfflineExam, updateExamMutation]);

  useEffect(() => {
    setTemplate(resolveTemplateId(initialTemplate));
  }, [initialTemplate]);

  useEffect(() => {
    setPrintMode(resolvePrintMode(answerKeyFromUrl, printModeFromUrl));
  }, [answerKeyFromUrl, printModeFromUrl]);

  useEffect(() => {
    const fromUrl = PAGE_SIZES.some((s) => s.value === pageSizeFromUrl)
      ? (pageSizeFromUrl as PageSizeValue)
      : getPageSizeFromSearch();
    setPageSize(fromUrl);
  }, [pageSizeFromUrl]);

  useEffect(() => {
    const fromUrl = orientationFromUrl === "landscape" ? "landscape" : getOrientationFromSearch();
    setOrientation(fromUrl);
  }, [orientationFromUrl]);

  useEffect(() => {
    const fromUrl = MARGIN_OPTIONS.some((s) => s.value === marginFromUrl)
      ? (marginFromUrl as MarginValue)
      : getMarginFromSearch();
    setMargin(fromUrl);
  }, [marginFromUrl]);

  useEffect(() => {
    const next =
      headerFromUrl && typeof headerFromUrl === "object"
        ? { ...getHeaderFromSearch(), ...headerFromUrl }
        : getHeaderFromSearch();
    setHeaderOverrides(next);
  }, [headerFromUrl]);

  const handleHeaderChange = (key: keyof PrintHeaderOverrides, value: string) => {
    const next = { ...headerOverrides, [key]: value || undefined };
    setHeaderOverrides(next);
    applyHeaderToUrl(next);
  };

  const handlePrintModeChange = (mode: ExamPrintMode) => {
    setPrintMode(mode);
    applyPrintModeToUrl(mode);
  };

  const handleTemplateChange = (newTemplate: ExamTemplateId) => {
    setTemplate(newTemplate);
    const url = new URL(window.location.href);
    if (newTemplate === "formal_school") {
      url.searchParams.delete("template");
    } else {
      url.searchParams.set("template", newTemplate);
    }
    window.history.replaceState({}, "", url.toString());
  };

  const handlePageSizeChange = (value: PageSizeValue) => {
    setPageSize(value);
    const url = new URL(window.location.href);
    url.searchParams.set("page_size", value);
    window.history.replaceState({}, "", url.toString());
  };

  const handleOrientationChange = (value: OrientationValue) => {
    setOrientation(value);
    const url = new URL(window.location.href);
    if (value === "portrait") {
      url.searchParams.delete("orientation");
    } else {
      url.searchParams.set("orientation", value);
    }
    window.history.replaceState({}, "", url.toString());
  };

  const handleMarginChange = (value: MarginValue) => {
    setMargin(value);
    const url = new URL(window.location.href);
    if (value === marginDefaultForUrl) {
      url.searchParams.delete("margin");
    } else {
      url.searchParams.set("margin", value);
    }
    window.history.replaceState({}, "", url.toString());
  };

  const pageSizeConfig = PAGE_SIZES.find((s) => s.value === pageSize) ?? PAGE_SIZES[0];
  const isLandscape = orientation === "landscape";
  const previewWidth = isLandscape ? pageSizeConfig.height : pageSizeConfig.width;
  const previewHeight = isLandscape ? pageSizeConfig.width : pageSizeConfig.height;
  const pageSizeCss = isLandscape ? `${pageSize} landscape` : pageSize;

  const sheetsToPrint: PrintHeaderOverrides[] = (() => {
    if (isAnswerKey) return [headerOverrides];
    if (participantOptions.length === 0) return [headerOverrides];
    const ids =
      selectedParticipantIds === "all"
        ? participantOptions.map((p) => p.id)
        : selectedParticipantIds;
    if (ids.length === 0) return [headerOverrides];
    return ids.map((id) => {
      const p = participantOptions.find((o) => o.id === id);
      const { firstName, lastName } = p
        ? splitFullName(p.name)
        : { firstName: "", lastName: "" };
      return { ...headerOverrides, studentFirstName: firstName, studentLastName: lastName };
    });
  })();

  const fitPreviewToWidth = useCallback(() => {
    const viewport = previewViewportRef.current;
    const content = printRef.current;
    if (!viewport || !content) return;
    const available = viewport.clientWidth - 16;
    const contentWidth = content.offsetWidth;
    if (contentWidth > 0 && available > 0) {
      setPreviewZoom(clampZoom(available / contentWidth));
    }
  }, []);

  useLayoutEffect(() => {
    if (previewFullscreen) {
      const viewport = fullscreenViewportRef.current;
      const content = viewport?.querySelector(".exam-print-root") as HTMLElement | null;
      if (viewport && content) {
        const available = viewport.clientWidth - 16;
        const contentWidth = content.offsetWidth;
        if (contentWidth > 0 && available > 0) {
          setPreviewZoom(clampZoom(available / contentWidth));
        }
      }
      return;
    }
    fitPreviewToWidth();
  }, [fitPreviewToWidth, pageSize, orientation, isAnswerKey, template, previewFullscreen]);

  useLayoutEffect(() => {
    if (printTab === 1) {
      fitPreviewToWidth();
    }
  }, [printTab, fitPreviewToWidth]);

  const templateVariant =
    EXAM_TEMPLATES.find((t) => t.id === template)?.questionVariant ?? "default";
  const selectedExamQuestion =
    selectedQuestionNumber != null
      ? examState.exam_questions?.[selectedQuestionNumber - 1]
      : undefined;
  const selectedQuestionType = String(
    (selectedExamQuestion?.payload as Record<string, unknown> | undefined)?.type ?? "essay"
  );
  const selectedBlankCount = Array.isArray(
    (selectedExamQuestion?.payload as Record<string, unknown> | undefined)?.blanks
  )
    ? ((selectedExamQuestion?.payload as Record<string, unknown>).blanks as unknown[]).length
    : undefined;

  const previewExam = useMemo(() => {
    if (!selectedExamQuestion || !printSettingsDraft) return examState;
    return {
      ...examState,
      exam_questions: examState.exam_questions?.map((eq) =>
        eq.id === selectedExamQuestion.id
          ? {
              ...eq,
              payload: {
                ...((eq.payload ?? {}) as Record<string, unknown>),
                print_settings: printSettingsDraft,
              },
            }
          : eq
      ),
    };
  }, [examState, selectedExamQuestion, printSettingsDraft]);

  const handleSaveQuestionPrintSettings = async (settings: QuestionPrintSettings) => {
    if (!selectedExamQuestion) return;
    const payload = {
      ...((selectedExamQuestion.payload ?? {}) as Record<string, unknown>),
      print_settings: settings,
    };
    await updateExamQuestionMutation.mutateAsync({
      examId: exam.id,
      questionId: selectedExamQuestion.id,
      data: { payload },
    });
    setExamState((prev) => ({
      ...prev,
      exam_questions: prev.exam_questions?.map((eq) =>
        eq.id === selectedExamQuestion.id ? { ...eq, payload } : eq
      ),
    }));
    setPrintSettingsDraft(null);
  };

  const openQuestionPrintSettings = (questionNumber: number) => {
    setSelectedQuestionNumber(questionNumber);
    const eq = examState.exam_questions?.[questionNumber - 1];
    const source = (eq?.payload ?? {}) as Record<string, unknown>;
    setPrintSettingsDraft(
      resolveQuestionPrintSettings({
        source,
        variant: templateVariant,
      })
    );
    setPrintDrawerOpen(true);
  };

  const closeQuestionPrintSettings = () => {
    setPrintDrawerOpen(false);
    setPrintSettingsDraft(null);
    setSelectedQuestionNumber(null);
  };

  const previewContentProps = {
    exam: previewExam,
    template,
    sheetsToPrint,
    isAnswerKey,
    previewWidth,
    previewHeight,
    insertBlankBetweenBooklets,
    pageSizeCss,
    marginNum,
    previewZoom,
    printInteraction:
      isOfflineExam && !isAnswerKey
        ? {
            interactive: true,
            onQuestionClick: openQuestionPrintSettings,
          }
        : undefined,
  };

  const renderQuestionPrintSidePanel = (embedded = false) => {
    if (!selectedExamQuestion || !printDrawerOpen) return null;
    return (
      <Paper
        elevation={embedded ? 0 : 2}
        sx={{
          width: { xs: "100%", sm: 380 },
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          maxHeight: embedded ? "100%" : undefined,
          borderRadius: embedded ? 0 : 2,
          borderLeft: embedded ? "1px solid" : undefined,
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={700}>
              تنظیمات چاپ — سوال {selectedQuestionNumber ?? ""}
            </Typography>
            <IconButton size="small" onClick={closeQuestionPrintSettings} aria-label="بستن">
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>
        <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
          <QuestionPrintSettingsPanel
            questionType={selectedQuestionType}
            value={printSettingsDraft ?? {}}
            onChange={setPrintSettingsDraft}
            variant={templateVariant}
            blankCount={selectedBlankCount}
            showAdvanced
          />
        </Box>
        <Stack direction="row" spacing={1} sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Button variant="outlined" onClick={closeQuestionPrintSettings} disabled={updateExamQuestionMutation.isPending} fullWidth>
            انصراف
          </Button>
          <Button
            variant="contained"
            onClick={() => printSettingsDraft && handleSaveQuestionPrintSettings(printSettingsDraft).then(closeQuestionPrintSettings)}
            disabled={updateExamQuestionMutation.isPending || !printSettingsDraft}
            fullWidth
            startIcon={updateExamQuestionMutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {updateExamQuestionMutation.isPending ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </Stack>
      </Paper>
    );
  };

  const renderPreviewRoot = (ref?: RefObject<HTMLDivElement | null>) => (
    <div
      ref={ref}
      className={`exam-print-root${isAnswerKey ? " exam-print-root--answer-key" : ""}`}
      dir="rtl"
    >
      <PrintPreviewContent {...previewContentProps} />
    </div>
  );

  const renderPreviewViewport = (
    viewportRef: RefObject<HTMLDivElement | null>,
    options: { fullscreen?: boolean; contentRef?: RefObject<HTMLDivElement | null> } = {}
  ) => (
    <Box
      ref={viewportRef}
      sx={{
        overflow: "auto",
        flex: options.fullscreen ? 1 : undefined,
        maxHeight: options.fullscreen
          ? "100%"
          : isDesktop
            ? "calc(100vh - 220px)"
            : "60vh",
        minHeight: options.fullscreen ? 0 : isDesktop ? 520 : 360,
        borderRadius: options.fullscreen ? 0 : 1,
        boxShadow: options.fullscreen ? 0 : 2,
        bgcolor: "grey.200",
        border: options.fullscreen ? "none" : "1px solid",
        borderColor: "divider",
        p: 1,
      }}
    >
      <Box
        sx={{
          transform: `scale(${previewZoom})`,
          transformOrigin: "top center",
          width: "fit-content",
          margin: "0 auto",
          transition: "transform 0.15s ease",
        }}
      >
        {renderPreviewRoot(options.contentRef ?? (options.fullscreen ? undefined : printRef))}
      </Box>
    </Box>
  );

  const printPageStyle = `
    @page { size: ${pageSizeCss}; margin: ${marginNum}mm; }
    html, body { direction: rtl; text-align: right; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    * { box-sizing: border-box; }
    @media print {
      .print-preview-page-frame,
      .print-preview-page-break-line,
      .print-preview-page-break-label,
      .print-preview-page-guides [aria-hidden="true"] {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        overflow: hidden !important;
        border: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }
    }
  `.trim();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: () => {
      const suffix = isAnswerKey ? "_پاسخنامه" : "";
      return `${exam.title}${suffix}_${new Date().toISOString().split("T")[0]}`;
    },
    bodyClass: "exam-print-rtl",
    pageStyle: printPageStyle,
    onPrintError: (_location, err) => {
      console.error("خطا در چاپ:", err);
    },
    suppressErrors: false,
    copyShadowRoots: false,
    ignoreGlobalStyles: false,
    preserveAfterPrint: false,
    fonts: [],
    printIframeProps: { referrerPolicy: "strict-origin-when-cross-origin" as const },
  });

  const headerFields = TEMPLATE_HEADER_FIELDS[template] ?? [];

  const settingsTabContent = (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: isAnswerKey ? "1fr" : "168px minmax(0, 1fr)",
        },
        gap: 2,
        alignItems: "start",
      }}
    >
        {/* راست (ستون اول در RTL): قالب + دکمه تغییر زیر آن */}
        {!isAnswerKey && (
          <Box
            sx={{
              width: { xs: "100%", md: 168 },
              maxWidth: { xs: 200, md: 168 },
              mx: { xs: "auto", md: 0 },
            }}
          >
            <SelectedTemplatePreview
              template={template}
              onChangeClick={() => setTemplateDialogOpen(true)}
            />
          </Box>
        )}

        {/* چپ (ستون دوم در RTL): تنظیمات چاپ و هدر */}
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              نوع برگه
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={printMode}
              onChange={(_, value: ExamPrintMode | null) => {
                if (value) handlePrintModeChange(value);
              }}
            >
              <ToggleButton value="student">برگه دانش‌آموز</ToggleButton>
              <ToggleButton value="answer_key">
                <KeyIcon sx={{ fontSize: 16, ml: 0.5 }} />
                پاسخنامه معلم
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {isAnswerKey && (
            <Typography variant="body2" color="text.secondary">
              قالب برگه روی پاسخنامه تأثیر ندارد.
            </Typography>
          )}

          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              صفحه
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: 1.5,
              }}
            >
              <FormControl size="small" fullWidth>
                <InputLabel>اندازه</InputLabel>
                <Select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(e.target.value as PageSizeValue)}
                  label="اندازه"
                >
                  {PAGE_SIZES.map(({ value, label }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>جهت</InputLabel>
                <Select
                  value={orientation}
                  onChange={(e) => handleOrientationChange(e.target.value as OrientationValue)}
                  label="جهت"
                >
                  {ORIENTATIONS.map(({ value, label }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>حاشیه</InputLabel>
                <Select
                  value={margin}
                  onChange={(e) => handleMarginChange(e.target.value as MarginValue)}
                  label="حاشیه"
                >
                  {MARGIN_OPTIONS.map(({ value, label }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {headerFields.length > 0 && !isAnswerKey && (
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                هدر برگه
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  },
                  gap: 1.5,
                }}
              >
                {headerFields.map(({ key, label }) => (
                  <TextField
                    key={key}
                    size="small"
                    label={label}
                    value={headerOverrides[key] ?? ""}
                    onChange={(e) => handleHeaderChange(key, e.target.value)}
                    placeholder={
                      key === "schoolName" ? (exam.partner?.name ?? label) : undefined
                    }
                  />
                ))}
              </Box>
            </Box>
          )}

          {participantOptions.length > 0 && !isAnswerKey && (
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <PeopleIcon color="action" fontSize="small" />
                <Typography variant="body2" fontWeight={600}>
                  شرکت‌کنندگان
                </Typography>
              </Box>
              <ParticipantSelector
                participants={participantOptions}
                selectedIds={selectedParticipantIds}
                onSelectionChange={setSelectedParticipantIds}
              />
              {sheetsToPrint.length > 1 && (
                <FormControlLabel
                  sx={{ mt: 1, ml: 0 }}
                  control={
                    <Checkbox
                      checked={insertBlankBetweenBooklets}
                      onChange={(e) => setInsertBlankBetweenBooklets(e.target.checked)}
                      size="small"
                    />
                  }
                  label="صفحهٔ خالی بین دفترچه‌ها (چاپ پشت‌ورو)"
                />
              )}
            </Box>
          )}

          {isOfflineExam && !isAnswerKey && (
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                یادداشت پاورقی
              </Typography>
              <TextField
                size="small"
                fullWidth
                multiline
                minRows={2}
                placeholder="متن یادداشت در پاورقی همهٔ صفحات چاپ (اختیاری)"
                value={footerNote}
                onChange={(e) => setFooterNote(e.target.value)}
                helperText="با تأخیر کوتاه در آزمون ذخیره می‌شود"
              />
            </Box>
          )}

          {!isOfflineExam && !isAnswerKey && (
            <Alert severity="info">
              سفارشی‌سازی چاپ (فضای پاسخ و یادداشت پاورقی) فقط برای آزمون‌های آفلاین در دسترس است.
            </Alert>
          )}
        </Stack>
    </Box>
  );

  const previewTabContent = (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: { xs: "60vh", md: "calc(100vh - 220px)" } }}>
      {isOfflineExam && !isAnswerKey && (
        <Alert severity="info" sx={{ mb: 1.5 }}>
          برای تنظیم فضای پاسخ هر سوال، روی آن در پیش‌نمایش کلیک کنید.
        </Alert>
      )}
      <PrintPreviewZoomBar
        zoom={previewZoom}
        onZoomChange={setPreviewZoom}
        onFitWidth={fitPreviewToWidth}
        onFullscreen={() => setPreviewFullscreen(true)}
      />
      <Box sx={{ flex: 1, minHeight: 0 }}>{renderPreviewViewport(previewViewportRef)}</Box>
    </Box>
  );

  return (
    <Box sx={{ mb: 2, "@media print": { display: "none !important" } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "flex-start" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>
            {isAnswerKey ? "چاپ پاسخنامه" : "چاپ برگه امتحان"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {exam.title}
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          sx={{ flexShrink: 0, alignSelf: { sm: "center" } }}
        >
          چاپ / ذخیره PDF
        </Button>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          "@media print": { display: "none !important" },
        }}
      >
        <Tabs
          value={printTab}
          onChange={(_, value: number) => setPrintTab(value)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab icon={<SettingsIcon />} iconPosition="start" label="تنظیمات چاپ" />
          <Tab icon={<PreviewIcon />} iconPosition="start" label="پیش‌نمایش" />
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 2.5 }, bgcolor: printTab === 1 ? "grey.50" : "background.paper" }}>
          {printTab === 0 && settingsTabContent}
          {printTab === 1 && previewTabContent}
        </Box>
      </Paper>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1.5, px: 0.5 }}
      >
        <PictureAsPdfIcon sx={{ fontSize: 14 }} />
        در پنجره چاپ «ذخیره به PDF» را انتخاب کنید.
      </Typography>

      <Dialog
        open={previewFullscreen}
        onClose={() => {
          if (printDrawerOpen) closeQuestionPrintSettings();
          setPreviewFullscreen(false);
        }}
        fullScreen
        aria-labelledby="print-preview-fullscreen-title"
      >
        <DialogTitle
          id="print-preview-fullscreen-title"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 1,
            px: 2,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            پیش‌نمایش چاپ — {exam.title}
          </Typography>
          <IconButton
            onClick={() => {
              if (printDrawerOpen) closeQuestionPrintSettings();
              setPreviewFullscreen(false);
            }}
            aria-label="بستن"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Box
          sx={{
            display: "flex",
            height: "calc(100vh - 64px)",
            overflow: "hidden",
            bgcolor: "grey.200",
          }}
        >
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, p: 1.5 }}>
            <PrintPreviewZoomBar
              zoom={previewZoom}
              onZoomChange={setPreviewZoom}
              onFitWidth={() => {
                const viewport = fullscreenViewportRef.current;
                const content = viewport?.querySelector(".exam-print-root") as HTMLElement | null;
                if (!viewport || !content) return;
                const available = viewport.clientWidth - 16;
                const contentWidth = content.offsetWidth;
                if (contentWidth > 0 && available > 0) {
                  setPreviewZoom(clampZoom(available / contentWidth));
                }
              }}
            />
            {renderPreviewViewport(fullscreenViewportRef, { fullscreen: true })}
          </Box>
          {printDrawerOpen && renderQuestionPrintSidePanel(true)}
        </Box>
      </Dialog>

      <TemplatePickerDialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        selected={template}
        onSelect={handleTemplateChange}
      />

      {isOfflineExam && !previewFullscreen && (
        <QuestionPrintSettingsDrawer
          open={printDrawerOpen}
          onClose={closeQuestionPrintSettings}
          title={`تنظیمات چاپ — سوال ${selectedQuestionNumber ?? ""}`}
          questionType={selectedQuestionType}
          initialSettings={
            (selectedExamQuestion?.payload as Record<string, unknown> | undefined)?.print_settings as
              | QuestionPrintSettings
              | undefined
          }
          variant={templateVariant}
          blankCount={selectedBlankCount}
          saving={updateExamQuestionMutation.isPending}
          onSave={handleSaveQuestionPrintSettings}
          onDraftChange={setPrintSettingsDraft}
        />
      )}
    </Box>
  );
}
