"use client";

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Stack,
  Paper,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import ImageIcon from '@mui/icons-material/Image';
import UserLayout from '@/components/layout/UserLayout';
import Breadcrumb from '@/components/Breadcrumb';

interface GuideStep {
  step: number;
  title: string;
  description: string;
  /** محل قرارگیری تصویر: صفحه و بخش مورد نظر */
  imagePlaceholder?: string;
}

interface Guide {
  title: string;
  icon: React.ReactNode;
  steps: GuideStep[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

function StepCard({ step }: { step: GuideStep }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        borderRight: '4px solid',
        borderColor: 'primary.main',
      }}
    >
      <Stack spacing={1.5}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          مرحله {step.step}: {step.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
          {step.description}
        </Typography>
        {step.imagePlaceholder && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              border: '1px dashed',
              borderColor: 'grey.400',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <ImageIcon color="action" />
            <Typography variant="body2" color="text.secondary">
              <strong>محل تصویر:</strong> {step.imagePlaceholder}
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}

const ROLE_GUIDES: Record<string, Guide> = {
  admin: {
    title: 'مدیر سیستم',
    icon: <AdminPanelSettingsIcon />,
    steps: [
      {
        step: 1,
        title: 'ورود به پنل مدیریت',
        description: 'از منوی سمت راست روی «پنل مدیریت» کلیک کنید.',
        imagePlaceholder: 'صفحه داشبورد، منوی سایدبار - گزینه «پنل مدیریت»',
      },
      {
        step: 2,
        title: 'مدیریت کاربران',
        description:
          'در پنل مدیریت، تب «کاربران» را باز کنید.\n\n' +
          '• برای افزودن کاربر جدید: روی دکمه «افزودن کاربر» کلیک کنید.\n' +
          '• برای ویرایش: روی آیکون ویرایش کنار هر کاربر کلیک کنید.\n' +
          '• برای غیرفعال کردن: روی آیکون فعال/غیرفعال کلیک کنید.\n' +
          '• برای ورود با اکانت کاربر: روی آیکون ورود کلیک کنید.\n' +
          '• ستون «اشتراک Pro» وضعیت اشتراک هر کاربر را نشان می‌دهد.',
        imagePlaceholder: 'صفحه پنل مدیریت > تب کاربران - جدول لیست کاربران با ستون اشتراک Pro',
      },
      {
        step: 3,
        title: 'مدیریت شرکا',
        description:
          'تب «شرکا» را باز کنید. شرکا سازمان‌هایی هستند که می‌توانند آزمون ایجاد کنند.\n\n' +
          '• برای افزودن شریک جدید روی دکمه مربوطه کلیک کنید.\n' +
          '• می‌توانید وضعیت فعال/غیرفعال هر شریک را تغییر دهید.',
        imagePlaceholder: 'صفحه پنل مدیریت > تب شرکا - لیست شرکا',
      },
      {
        step: 4,
        title: 'مدیریت آزمون‌ها و بانک سوالات',
        description:
          'به عنوان مدیر به «مدیریت آزمون‌ها» و «بانک سوالات» از منو دسترسی دارید.\n\n' +
          '• در مدیریت آزمون‌ها: تمام آزمون‌های سیستم را می‌بینید و می‌توانید ایجاد، ویرایش، حذف، منتشر و غیرفعال کنید.\n' +
          '• در بانک سوالات: سوالات و دسته‌بندی‌ها را مدیریت کنید.',
        imagePlaceholder: 'صفحه مدیریت آزمون‌ها - نمای لیست یا تقویم',
      },
    ],
  },
  content_manager: {
    title: 'مدیر محتوا',
    icon: <QuizIcon />,
    steps: [
      {
        step: 1,
        title: 'ورود به بانک سوالات',
        description: 'از منوی سمت راست روی «بانک سوالات» کلیک کنید. شما فقط به این بخش دسترسی دارید.',
        imagePlaceholder: 'صفحه داشبورد - منوی سایدبار با گزینه بانک سوالات',
      },
      {
        step: 2,
        title: 'افزودن سوال جدید',
        description:
          'روی دکمه «افزودن سوال» کلیک کنید.\n\n' +
          '• نوع سوال را انتخاب کنید (چندگزینه‌ای، تشریحی، صحیح/غلط و...)\n' +
          '• متن سوال و گزینه‌ها را وارد کنید.\n' +
          '• پاسخ صحیح را مشخص کنید.\n' +
          '• دسته‌بندی و سطح سختی را انتخاب کنید.',
        imagePlaceholder: 'صفحه بانک سوالات - فرم افزودن سوال',
      },
      {
        step: 3,
        title: 'ویرایش و حذف سوالات',
        description:
          'در لیست سوالات، روی آیکون ویرایش یا حذف کنار هر سوال کلیک کنید.\n\n' +
          '• دسته‌بندی‌ها را از بخش مربوطه مدیریت کنید.',
        imagePlaceholder: 'صفحه بانک سوالات - لیست سوالات با دکمه‌های ویرایش و حذف',
      },
    ],
  },
  creator: {
    title: 'سازنده آزمون',
    icon: <SchoolIcon />,
    steps: [
      {
        step: 1,
        title: 'شروع ایجاد آزمون',
        description: 'از منو روی «ایجاد آزمون» کلیک کنید.',
        imagePlaceholder: 'صفحه داشبورد - منوی سایدبار با گزینه ایجاد آزمون',
      },
      {
        step: 2,
        title: 'مرحله ۱: اطلاعات پایه',
        description:
          'عنوان آزمون، نوع (آنلاین/آفلاین) و توضیحات را وارد کنید.\n\n' +
          '• در صورت نیاز شریک را انتخاب کنید.',
        imagePlaceholder: 'صفحه ایجاد آزمون - مرحله اطلاعات پایه',
      },
      {
        step: 3,
        title: 'مرحله ۲: افزودن سوالات',
        description:
          'سوالات را از بانک سوالات انتخاب کنید یا سوال سفارشی اضافه کنید.\n\n' +
          '• برای هر سوال می‌توانید بارم (نمره) را جداگانه تنظیم کنید.\n' +
          '• ترتیب سوالات را با کشیدن و رها کردن تغییر دهید.',
        imagePlaceholder: 'صفحه ایجاد آزمون - مرحله سوالات با فیلد بارم',
      },
      {
        step: 4,
        title: 'مرحله ۳: تنظیمات و زمان‌بندی',
        description:
          'مدت زمان آزمون، نمره قبولی و در صورت نیاز تاریخ و ساعت شروع و پایان را تنظیم کنید.',
        imagePlaceholder: 'صفحه ایجاد آزمون - مرحله تنظیمات',
      },
      {
        step: 5,
        title: 'مدیریت آزمون و افزودن شرکت‌کننده',
        description:
          'پس از ایجاد، به صفحه جزئیات آزمون بروید.\n\n' +
          '• تب «شرکت‌کنندگان» را باز کنید.\n' +
          '• با شماره تلفن، کد ملی یا از طریق گروه‌ها شرکت‌کننده اضافه کنید.',
        imagePlaceholder: 'صفحه جزئیات آزمون > تب شرکت‌کنندگان - فرم افزودن با تلفن یا کد ملی',
      },
      {
        step: 6,
        title: 'تصحیح دستی و تصحیح با AI',
        description:
          'از منوی عملیات آزمون (آیکون سه‌نقطه) گزینه «تصحیح دستی» را انتخاب کنید.\n\n' +
          '• شرکت‌کننده را انتخاب کنید.\n' +
          '• برای سوالات تشریحی نمره وارد کنید.\n' +
          '• با اشتراک Pro: دکمه «تصحیح با AI» یا «تصحیح کل با AI» را بزنید.',
        imagePlaceholder: 'صفحه تصحیح دستی - جدول سوالات با دکمه‌های AI',
      },
      {
        step: 7,
        title: 'چاپ برگه امتحان',
        description:
          'برای آزمون‌های آفلاین، از منوی عملیات گزینه «چاپ برگه امتحان» را انتخاب کنید.\n\n' +
          '• قالب مورد نظر (مدرسه، دانشگاه، ساده و...) را انتخاب کنید.\n' +
          '• بارم هر سوال در قالب نمایش داده می‌شود.',
        imagePlaceholder: 'صفحه چاپ آزمون - انتخاب قالب و پیش‌نمایش با ستون بارم',
      },
    ],
  },
  student: {
    title: 'دانش‌آموز',
    icon: <PersonIcon />,
    steps: [
      {
        step: 1,
        title: 'مشاهده آزمون‌های موجود',
        description:
          'به «آزمون‌های من» بروید. لیست آزمون‌هایی که معلم برای شما تعریف کرده را می‌بینید.\n\n' +
          '• روی دکمه «شرکت» کلیک کنید تا آزمون را شروع کنید.',
        imagePlaceholder: 'صفحه آزمون‌های من - لیست آزمون‌ها با دکمه شرکت',
      },
      {
        step: 2,
        title: 'شرکت در آزمون',
        description:
          'پس از شروع:\n\n' +
          '• به هر سوال پاسخ دهید.\n' +
          '• پاسخ‌ها به صورت خودکار ذخیره می‌شوند.\n' +
          '• زمان باقی‌مانده در بالای صفحه نمایش داده می‌شود.\n' +
          '• در پایان روی «ارسال پاسخ‌ها» کلیک کنید.',
        imagePlaceholder: 'صفحه شرکت در آزمون - نمای سوال با تایمر',
      },
      {
        step: 3,
        title: 'مشاهده نتیجه',
        description:
          'پس از ارسال، به صفحه نتیجه هدایت می‌شوید.\n\n' +
          '• نمره، رتبه، تعداد صحیح و غلط را می‌بینید.\n' +
          '• هر سوال با پاسخ صحیح و پاسخ شما نمایش داده می‌شود.\n' +
          '• با اشتراک Pro: دکمه «بررسی با AI» برای توضیح بیشتر هر سوال.',
        imagePlaceholder: 'صفحه نتیجه آزمون - خلاصه نمره و لیست سوالات با دکمه بررسی با AI',
      },
    ],
  },
};

export default function SupportPage() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <UserLayout>
      <Stack spacing={3}>
        <Breadcrumb items={[{ label: 'پشتیبانی و آموزش' }]} />
        <Typography variant="h4">پشتیبانی و آموزش</Typography>
        <Typography color="text.secondary">
          راهنمای مرحله‌به‌مرحله استفاده از سیستم برای هر نقش
        </Typography>

        <Card>
          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="مدیر سیستم" icon={<AdminPanelSettingsIcon />} iconPosition="start" />
            <Tab label="مدیر محتوا" icon={<QuizIcon />} iconPosition="start" />
            <Tab label="سازنده آزمون" icon={<SchoolIcon />} iconPosition="start" />
            <Tab label="دانش‌آموز" icon={<PersonIcon />} iconPosition="start" />
          </Tabs>
          <CardContent>
            {(['admin', 'content_manager', 'creator', 'student'] as const).map((role, index) => (
              <TabPanel key={role} value={tabValue} index={index}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  {ROLE_GUIDES[role].icon}
                  <Typography variant="h6">{ROLE_GUIDES[role].title}</Typography>
                </Stack>

                {ROLE_GUIDES[role].steps.map((step) => (
                  <StepCard key={step.step} step={step} />
                ))}
              </TabPanel>
            ))}
          </CardContent>
        </Card>
      </Stack>
    </UserLayout>
  );
}
