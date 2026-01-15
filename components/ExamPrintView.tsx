"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SimplePersianTemplate from './exam-templates/SimplePersianTemplate';
import FormalSchoolTemplate from './exam-templates/FormalSchoolTemplate';
import DefaultTemplate from './exam-templates/DefaultTemplate';
import CollegeTemplate from './exam-templates/CollegeTemplate';
import PersianCollegeTemplate from './exam-templates/PersianCollegeTemplate';
import ModernTemplate from './exam-templates/ModernTemplate';
import ClassicTemplate from './exam-templates/ClassicTemplate';

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
}

export default function ExamPrintView({ exam, template: initialTemplate }: ExamPrintViewProps) {
  const [template, setTemplate] = useState(initialTemplate);

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

  const renderTemplate = () => {
    switch (template) {
      case 'simple_persian':
        return <SimplePersianTemplate exam={exam} />;
      case 'formal_school':
        return <FormalSchoolTemplate exam={exam} />;
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
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          left: 20,
          background: 'white',
          padding: 2,
          borderRadius: 2,
          boxShadow: 3,
          zIndex: 1000,
          minWidth: 250,
          '@media print': {
            display: 'none',
          },
        }}
      >
        <FormControl fullWidth>
          <InputLabel>انتخاب قالب</InputLabel>
          <Select
            value={template}
            onChange={(e) => handleTemplateChange(e.target.value)}
            label="انتخاب قالب"
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
      </Box>

      <Button
        variant="contained"
        onClick={() => window.print()}
        sx={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          zIndex: 1000,
          '@media print': {
            display: 'none',
          },
        }}
      >
        🖨️ چاپ آزمون
      </Button>

      {renderTemplate()}
    </Box>
  );
}

