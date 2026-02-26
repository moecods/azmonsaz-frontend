"use client";

import { useState, useEffect, useRef } from 'react';
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
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import { useReactToPrint } from 'react-to-print';
import SimplePersianTemplate from './exam-templates/SimplePersianTemplate';
import FormalSchoolTemplate from './exam-templates/FormalSchoolTemplate';
import DefaultTemplate from './exam-templates/DefaultTemplate';
import CollegeTemplate from './exam-templates/CollegeTemplate';
import PersianCollegeTemplate from './exam-templates/PersianCollegeTemplate';
import ModernTemplate from './exam-templates/ModernTemplate';
import ClassicTemplate from './exam-templates/ClassicTemplate';
import ParticipantSelector, { type ParticipantOption } from './exams/ParticipantSelector';

const PAGE_SIZES = [
  { value: 'A4', label: 'A4 (۲۱۰×۲۹۷ mm)', width: '210mm', height: '297mm' },
  { value: 'A3', label: 'A3 (۲۹۷×۴۲۰ mm)', width: '297mm', height: '420mm' },
  { value: 'A5', label: 'A5 (۱۴۸×۲۱۰ mm)', width: '148mm', height: '210mm' },
  { value: 'Letter', label: 'Letter (۲۱۶×۲۷۹ mm)', width: '8.5in', height: '11in' },
] as const;
type PageSizeValue = (typeof PAGE_SIZES)[number]['value'];

const ORIENTATIONS = [
  { value: 'portrait', label: 'عمودی (Portrait)' },
  { value: 'landscape', label: 'افقی (Landscape)' },
] as const;
type OrientationValue = (typeof ORIENTATIONS)[number]['value'];

function getOrientationFromSearch(): OrientationValue {
  if (typeof window === 'undefined') return 'portrait';
  const o = new URLSearchParams(window.location.search).get('orientation');
  return o === 'landscape' ? 'landscape' : 'portrait';
}

const MARGIN_OPTIONS = [
  { value: '0', label: 'بدون حاشیه' },
  { value: '5', label: 'کم (۵ mm)' },
  { value: '10', label: 'متوسط (۱۰ mm)' },
  { value: '15', label: 'زیاد (۱۵ mm)' },
] as const;
type MarginValue = (typeof MARGIN_OPTIONS)[number]['value'];

function getMarginFromSearch(): MarginValue {
  if (typeof window === 'undefined') return '0';
  const m = new URLSearchParams(window.location.search).get('margin');
  return MARGIN_OPTIONS.some((s) => s.value === m) ? (m as MarginValue) : '0';
}

/** مقادیر هدر چاپ — هر قالب از زیرمجموعه‌ای از این فیلدها استفاده می‌کند */
export interface PrintHeaderOverrides {
  schoolName?: string;
  className?: string;
  grade?: string;
  studentCode?: string;
  courseName?: string;
  examDate?: string;
  examTime?: string;
  teacherName?: string;
  /** نام شرکت‌کننده (برای برگه به ازای هر نفر) */
  studentFirstName?: string;
  /** نام خانوادگی شرکت‌کننده */
  studentLastName?: string;
}

/** فیلدهای هدر قابل ویرایش به ازای هر قالب (هر قالب هدر و متغیرهای خاص خودش را دارد) */
export const TEMPLATE_HEADER_FIELDS: Record<string, { key: keyof PrintHeaderOverrides; label: string }[]> = {
  formal_school: [
    { key: 'schoolName', label: 'اسم مدرسه' },
    { key: 'className', label: 'کلاس' },
    { key: 'grade', label: 'پایه' },
    { key: 'studentCode', label: 'کد دانش‌آموزی' },
    { key: 'courseName', label: 'درس' },
    { key: 'examDate', label: 'تاریخ امتحان' },
    { key: 'examTime', label: 'وقت امتحان' },
    { key: 'teacherName', label: 'نام دبیر' },
  ],
  default: [],
  college: [],
  persian_college: [],
  modern: [],
  classic: [],
  simple_persian: [],
};

const HEADER_KEY_TO_URL: Record<keyof PrintHeaderOverrides, string> = {
  schoolName: 'school_name',
  className: 'class',
  grade: 'grade',
  studentCode: 'student_code',
  courseName: 'course',
  examDate: 'exam_date',
  examTime: 'exam_time',
  teacherName: 'teacher_name',
  studentFirstName: 'student_first_name',
  studentLastName: 'student_last_name',
};

function getHeaderFromSearch(): PrintHeaderOverrides {
  if (typeof window === 'undefined') return {};
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
  window.history.replaceState({}, '', url.toString());
}

/** یک شرکت‌کننده برای انتخاب در چاپ (نام برای نمایش روی برگه) */
export interface PrintParticipantOption {
  id: number;
  name: string;
  phone_number?: string | null;
  email?: string | null;
}

interface ExamPrintViewProps {
  exam: {
    id: number;
    title: string;
    partner_id?: number;
    type?: 'offline' | 'online';
    meta?: {
      duration_minutes?: number;
      passing_score?: number;
      instructions?: string;
    };
    published_at?: string | null;
    exam_questions?: Array<{
      id: number;
      question_id?: number | null;
      payload?: any;
      created_at?: string;
      updated_at?: string;
    }>;
    partner?: {
      name?: string;
    };
  };
  /** لیست شرکت‌کنندگان برای چاپ برگه به ازای هر نفر (پیش‌فرض: همه) */
  participants?: PrintParticipantOption[];
  template: string;
  /** اندازه صفحه از URL (مثلاً A4, A3) */
  pageSizeFromUrl?: string | null;
  /** جهت صفحه از URL (portrait | landscape) */
  orientationFromUrl?: string | null;
  /** حاشیه چاپ از URL (۵، ۱۰، ۱۵) */
  marginFromUrl?: string | null;
  /** مقادیر هدر از URL (برای قالب رسمی مدرسه و مشابه) */
  headerFromUrl?: PrintHeaderOverrides | null;
}

function getPageSizeFromSearch(): PageSizeValue {
  if (typeof window === 'undefined') return 'A4';
  const p = new URLSearchParams(window.location.search).get('page_size');
  return PAGE_SIZES.some((s) => s.value === p) ? (p as PageSizeValue) : 'A4';
}

/** تقسیم نام کامل به نام و نام خانوادگی (اولین فاصله) */
function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const t = (fullName || '').trim();
  const i = t.indexOf(' ');
  if (i <= 0) return { firstName: t, lastName: '' };
  return { firstName: t.slice(0, i), lastName: t.slice(i + 1).trim() };
}

export default function ExamPrintView({ exam, participants = [], template: initialTemplate, pageSizeFromUrl, orientationFromUrl, marginFromUrl, headerFromUrl }: ExamPrintViewProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const printRef = useRef<HTMLDivElement>(null);
  const [template, setTemplate] = useState(initialTemplate);
  const participantOptions: ParticipantOption[] = participants.map((p) => ({ id: p.id, name: p.name, phone_number: p.phone_number ?? null, email: p.email ?? null }));
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<number[] | 'all'>([]);
  /** برای چاپ پشت‌ورو وقتی هر امتحان تعداد صفحات فرد دارد؛ اگر هر امتحان ۱ برگ (۲ صفحه) است خاموش شود */
  const [insertBlankBetweenBooklets, setInsertBlankBetweenBooklets] = useState(true);
  const initialHeader = headerFromUrl && typeof headerFromUrl === 'object' ? { ...getHeaderFromSearch(), ...headerFromUrl } : getHeaderFromSearch();
  const [headerOverrides, setHeaderOverrides] = useState<PrintHeaderOverrides>(initialHeader);
  const initialPageSize: PageSizeValue = PAGE_SIZES.some((s) => s.value === pageSizeFromUrl)
    ? (pageSizeFromUrl as PageSizeValue)
    : getPageSizeFromSearch();
  const [pageSize, setPageSize] = useState<PageSizeValue>(initialPageSize);
  const initialOrientation: OrientationValue = orientationFromUrl === 'landscape' ? 'landscape' : getOrientationFromSearch();
  const [orientation, setOrientation] = useState<OrientationValue>(initialOrientation);
  const initialMargin: MarginValue = MARGIN_OPTIONS.some((s) => s.value === marginFromUrl) ? (marginFromUrl as MarginValue) : getMarginFromSearch();
  const marginDefaultForUrl = '0';
  const [margin, setMargin] = useState<MarginValue>(initialMargin);
  const marginNum = margin === '0' ? 0 : Number(margin);

  useEffect(() => {
    const fromUrl = PAGE_SIZES.some((s) => s.value === pageSizeFromUrl)
      ? (pageSizeFromUrl as PageSizeValue)
      : getPageSizeFromSearch();
    setPageSize(fromUrl);
  }, [pageSizeFromUrl]);

  useEffect(() => {
    const fromUrl = orientationFromUrl === 'landscape' ? 'landscape' : getOrientationFromSearch();
    setOrientation(fromUrl);
  }, [orientationFromUrl]);

  useEffect(() => {
    const fromUrl = MARGIN_OPTIONS.some((s) => s.value === marginFromUrl) ? (marginFromUrl as MarginValue) : getMarginFromSearch();
    setMargin(fromUrl);
  }, [marginFromUrl]);

  useEffect(() => {
    const next = headerFromUrl && typeof headerFromUrl === 'object' ? { ...getHeaderFromSearch(), ...headerFromUrl } : getHeaderFromSearch();
    setHeaderOverrides(next);
  }, [headerFromUrl]);

  const handleHeaderChange = (key: keyof PrintHeaderOverrides, value: string) => {
    const next = { ...headerOverrides, [key]: value || undefined };
    setHeaderOverrides(next);
    applyHeaderToUrl(next);
  };

  const handleTemplateChange = (newTemplate: string) => {
    setTemplate(newTemplate);
    const url = new URL(window.location.href);
    if (newTemplate === 'default') {
      url.searchParams.delete('template');
    } else {
      url.searchParams.set('template', newTemplate);
    }
    window.history.replaceState({}, '', url.toString());
  };

  const handlePageSizeChange = (value: PageSizeValue) => {
    setPageSize(value);
    const url = new URL(window.location.href);
    url.searchParams.set('page_size', value);
    window.history.replaceState({}, '', url.toString());
  };

  const handleOrientationChange = (value: OrientationValue) => {
    setOrientation(value);
    const url = new URL(window.location.href);
    if (value === 'portrait') {
      url.searchParams.delete('orientation');
    } else {
      url.searchParams.set('orientation', value);
    }
    window.history.replaceState({}, '', url.toString());
  };

  const handleMarginChange = (value: MarginValue) => {
    setMargin(value);
    const url = new URL(window.location.href);
    if (value === marginDefaultForUrl) {
      url.searchParams.delete('margin');
    } else {
      url.searchParams.set('margin', value);
    }
    window.history.replaceState({}, '', url.toString());
  };

  const pageSizeConfig = PAGE_SIZES.find((s) => s.value === pageSize) ?? PAGE_SIZES[0];
  const isLandscape = orientation === 'landscape';
  const previewWidth = isLandscape ? pageSizeConfig.height : pageSizeConfig.width;
  const previewHeight = isLandscape ? pageSizeConfig.width : pageSizeConfig.height;
  const pageSizeCss = isLandscape ? `${pageSize} landscape` : pageSize;

  const printPageStyle = `
    @page { size: ${pageSizeCss}; margin: ${marginNum}mm; }
    html, body { direction: rtl; text-align: right; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    * { box-sizing: border-box; }
  `.trim();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: () => `${exam.title}_${new Date().toISOString().split('T')[0]}`,
    bodyClass: 'exam-print-rtl',
    pageStyle: printPageStyle,
    onBeforePrint: async () => {
      // قبل از باز شدن دیالوگ چاپ؛ می‌توان لود فونت یا آماده‌سازی انجام داد
    },
    onAfterPrint: () => {
      // بعد از بسته شدن دیالوگ چاپ (چاپ یا لغو)
    },
    onPrintError: (_location, err) => {
      console.error('خطا در چاپ:', err);
    },
    suppressErrors: false,
    copyShadowRoots: false,
    ignoreGlobalStyles: false,
    preserveAfterPrint: false,
    fonts: [],
    printIframeProps: { referrerPolicy: 'strict-origin-when-cross-origin' as const },
  });

  /** برگه‌های چاپ: به ازای هر شرکت‌کنندهٔ انتخاب‌شده یک برگه با نام او؛ اگر شرکت‌کننده‌ای انتخاب نشده یک برگه بدون نام */
  const sheetsToPrint: PrintHeaderOverrides[] = (() => {
    if (participantOptions.length === 0) return [headerOverrides];
    const ids = selectedParticipantIds === 'all' ? participantOptions.map((p) => p.id) : selectedParticipantIds;
    if (ids.length === 0) return [headerOverrides];
    return ids.map((id) => {
      const p = participantOptions.find((o) => o.id === id);
      const { firstName, lastName } = p ? splitFullName(p.name) : { firstName: '', lastName: '' };
      return { ...headerOverrides, studentFirstName: firstName, studentLastName: lastName };
    });
  })();

  const renderTemplate = (sheetHeader: PrintHeaderOverrides) => {
    switch (template) {
      case 'simple_persian':
        return <SimplePersianTemplate exam={exam} />;
      case 'formal_school':
        return <FormalSchoolTemplate exam={exam} headerOverrides={sheetHeader} />;
      case 'college':
        return <CollegeTemplate exam={exam} />;
      case 'persian_college':
        return <PersianCollegeTemplate exam={exam} />;
      case 'modern':
        return <ModernTemplate exam={exam} />;
      case 'classic':
        return <ClassicTemplate exam={exam} />;
      default:
        return <DefaultTemplate exam={exam} />;
    }
  };

  const settingsPanel = (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        '@media print': { display: 'none !important' },
        ...(isDesktop && { position: 'sticky', top: 16, maxHeight: 'calc(100vh - 32px)', overflow: 'auto' }),
      }}
    >
      <Stack spacing={2.5}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <SettingsIcon color="action" fontSize="small" />
          <Typography variant="subtitle1" fontWeight="600">تنظیمات چاپ</Typography>
        </Box>
        <FormControl fullWidth size="small">
          <InputLabel>قالب برگه</InputLabel>
          <Select
            value={template}
            onChange={(e) => handleTemplateChange(e.target.value)}
            label="قالب برگه"
          >
            <MenuItem value="default">پیش‌فرض (رنگی و مدرن)</MenuItem>
            <MenuItem value="college">دانشگاهی انگلیسی</MenuItem>
            <MenuItem value="persian_college">دانشگاهی فارسی</MenuItem>
            <MenuItem value="modern">مدرن (گرادیان)</MenuItem>
            <MenuItem value="classic">کلاسیک (ساده)</MenuItem>
            <MenuItem value="simple_persian">ساده فارسی</MenuItem>
            <MenuItem value="formal_school">رسمی مدرسه</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 120, flex: '1 1 120px' }}>
            <InputLabel>اندازه صفحه</InputLabel>
            <Select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(e.target.value as PageSizeValue)}
              label="اندازه صفحه"
            >
              {PAGE_SIZES.map(({ value, label }) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120, flex: '1 1 120px' }}>
            <InputLabel>جهت</InputLabel>
            <Select
              value={orientation}
              onChange={(e) => handleOrientationChange(e.target.value as OrientationValue)}
              label="جهت"
            >
              {ORIENTATIONS.map(({ value, label }) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {(TEMPLATE_HEADER_FIELDS[template]?.length ?? 0) > 0 && (
          <Accordion defaultExpanded disableGutters elevation={0} sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 40 }}>
              <Typography variant="body2" fontWeight="500">هدر برگه (اسم مدرسه، کلاس، …)</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0, pt: 0 }}>
              <Stack direction="row" flexWrap="wrap" gap={1.5} useFlexGap>
                {TEMPLATE_HEADER_FIELDS[template].map(({ key, label }) => (
                  <TextField
                    key={key}
                    size="small"
                    label={label}
                    value={headerOverrides[key] ?? ''}
                    onChange={(e) => handleHeaderChange(key, e.target.value)}
                    placeholder={key === 'schoolName' ? (exam.partner?.name ?? label) : undefined}
                    sx={{ minWidth: 140, flex: '1 1 140px' }}
                  />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}

        {participantOptions.length > 0 && (
          <>
            <Divider />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon color="action" fontSize="small" />
              <Typography variant="body2" fontWeight="500">شرکت‌کنندگان</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -0.5 }}>
              نام و نام خانوادگی روی هر برگه درج می‌شود.
            </Typography>
            <ParticipantSelector
              participants={participantOptions}
              selectedIds={selectedParticipantIds}
              onSelectionChange={setSelectedParticipantIds}
            />
            {sheetsToPrint.length > 1 && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={insertBlankBetweenBooklets}
                    onChange={(e) => setInsertBlankBetweenBooklets(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="caption">
                    صفحهٔ خالی بین دفترچه‌ها (برای چاپ پشت‌ورو وقتی صفحات هر امتحان فرد است)
                  </Typography>
                }
                sx={{ mt: 0.5 }}
              />
            )}
          </>
        )}

        <Divider />
        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          sx={{ py: 1.25 }}
        >
          چاپ / ذخیره PDF
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PictureAsPdfIcon sx={{ fontSize: 14 }} />
          در پنجره چاپ می‌توانید «ذخیره به PDF» را انتخاب کنید.
        </Typography>
      </Stack>
    </Paper>
  );

  return (
    <Box sx={{ mb: 2, '@media print': { display: 'none !important' } }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row-reverse' },
          gap: 3,
          alignItems: 'stretch',
        }}
      >
        <Box sx={{ flex: { md: '1 1 0%' }, minWidth: 0 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'grey.50',
              '@media print': { display: 'none !important' },
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              پیش‌نمایش چاپ
            </Typography>
            <Box
              sx={{
                overflow: 'auto',
                maxHeight: isDesktop ? 'calc(100vh - 180px)' : undefined,
                borderRadius: 1,
                boxShadow: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <div ref={printRef} className="exam-print-root" dir="rtl">
                <style
                  dangerouslySetInnerHTML={{
                    __html: `@media print { @page { size: ${pageSizeCss}; margin-top: ${Math.max(marginNum, 10)}mm; margin-right: ${marginNum}mm; margin-bottom: ${marginNum}mm; margin-left: ${marginNum}mm; } }`,
                  }}
                />
                <Box className="exam-print-content" sx={{ width: previewWidth, maxWidth: previewWidth, boxSizing: 'border-box', margin: '0 auto', overflow: 'hidden' }}>
                  {sheetsToPrint.map((sheetHeader, index) => (
                    <Box key={`sheet-${index}`}>
                      <Box
                        sx={{
                          width: '100%',
                          minHeight: previewHeight,
                          boxSizing: 'border-box',
                          ...(index > 0 && !insertBlankBetweenBooklets && { pageBreakBefore: 'always' }),
                        }}
                      >
                        {renderTemplate(sheetHeader)}
                      </Box>
                      {sheetsToPrint.length > 1 && index < sheetsToPrint.length - 1 && insertBlankBetweenBooklets && (
                        <Box
                          sx={{
                            width: '100%',
                            minHeight: previewHeight,
                            boxSizing: 'border-box',
                            pageBreakBefore: 'always',
                          }}
                          aria-hidden="true"
                        />
                      )}
                    </Box>
                  ))}
                </Box>
                <div className="exam-print-footer" aria-hidden="true">
                  <span>{exam.title}</span>
                  <span>
                    صفحه <span className="page-num" /> از <span className="page-total" />
                  </span>
                </div>
              </div>
            </Box>
          </Paper>
        </Box>
        <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0 }}>
          {settingsPanel}
        </Box>
      </Box>
    </Box>
  );
}

