"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import SimplePersianTemplate from './exam-templates/SimplePersianTemplate';
import FormalSchoolTemplate from './exam-templates/FormalSchoolTemplate';
import DefaultTemplate from './exam-templates/DefaultTemplate';
import CollegeTemplate from './exam-templates/CollegeTemplate';
import PersianCollegeTemplate from './exam-templates/PersianCollegeTemplate';
import ModernTemplate from './exam-templates/ModernTemplate';
import ClassicTemplate from './exam-templates/ClassicTemplate';

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
    completed_at?: string | null;
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

export default function ExamPrintView({ exam, template: initialTemplate, pageSizeFromUrl, orientationFromUrl, marginFromUrl, headerFromUrl }: ExamPrintViewProps) {
  const [template, setTemplate] = useState(initialTemplate);
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

  const renderTemplate = () => {
    switch (template) {
      case 'simple_persian':
        return <SimplePersianTemplate exam={exam} />;
      case 'formal_school':
        return <FormalSchoolTemplate exam={exam} headerOverrides={headerOverrides} />;
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

  return (
    <Box>
      {/* نوار ابزار بالا — در چاپ نمایش داده نمی‌شود */}
      <Stack
        direction="column"
        spacing={2}
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
          bgcolor: 'background.paper',
          '@media print': {
            display: 'none !important',
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <FormControl sx={{ minWidth: 260 }}>
            <InputLabel>قالب برگه امتحان</InputLabel>
            <Select
              value={template}
              onChange={(e) => handleTemplateChange(e.target.value)}
              label="قالب برگه امتحان"
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
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            چاپ مستقیم
          </Button>
        </Stack>

        {(TEMPLATE_HEADER_FIELDS[template]?.length ?? 0) > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={2} useFlexGap>
            {TEMPLATE_HEADER_FIELDS[template].map(({ key, label }) => (
              <TextField
                key={key}
                size="small"
                label={label}
                value={headerOverrides[key] ?? ''}
                onChange={(e) => handleHeaderChange(key, e.target.value)}
                placeholder={key === 'schoolName' ? (exam.partner?.name ?? label) : undefined}
                sx={{ minWidth: 120 }}
              />
            ))}
          </Stack>
        )}
      </Stack>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 2,
          px: 2,
          '@media print': { display: 'none !important' },
        }}
      >
        برای ذخیره به PDF: دکمه «چاپ مستقیم» را بزنید و در پنجره چاپ گزینه «ذخیره به PDF» یا «Print to PDF» را انتخاب کنید. یا از کلیدهای Ctrl+P (Windows) / Cmd+P (Mac) استفاده کنید.
      </Typography>

      {/* اندازه و حاشیه چهار طرف صریح تا در RTL حاشیه یکسان باشد */}
      <style
        dangerouslySetInnerHTML={{
          __html: `@media print { @page { size: ${pageSizeCss}; margin-top: ${marginNum}mm; margin-right: ${marginNum}mm; margin-bottom: ${marginNum}mm; margin-left: ${marginNum}mm; } }`,
        }}
      />
      <Box
        className="exam-print-content"
        sx={{
          width: previewWidth,
          minHeight: previewHeight,
          maxWidth: previewWidth,
          boxSizing: 'border-box',
          margin: '0 auto',
          overflow: 'hidden',
        }}
      >
        {renderTemplate()}
      </Box>
      {/* فوتر فقط در چاپ: عنوان آزمون و شماره صفحه */}
      <div className="exam-print-footer" aria-hidden="true">
        <span>{exam.title}</span>
        <span>
          صفحه <span className="page-num" /> از <span className="page-total" />
        </span>
      </div>
    </Box>
  );
}

