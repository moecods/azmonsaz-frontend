"use client";

import { Box, Typography } from '@mui/material';
import { isEssay, getQuestionTypeLabel } from '@/lib/question-types';

interface Exam {
  id: number;
  title: string;
  meta?: {
    duration_minutes?: number;
    passing_score?: number;
    instructions?: string;
    points_per_question?: number;
  };
  exam_questions?: Array<{
    id: number;
    payload?: any;
  }>;
}

interface SimplePersianTemplateProps {
  exam: Exam;
}

export default function SimplePersianTemplate({ exam }: SimplePersianTemplateProps) {
  const persianLabels = ['الف', 'ب', 'ج', 'د', 'ه', 'و'];

  return (
    <Box
      sx={{
        fontFamily: '"B Nazanin", "Tahoma", "Arial", sans-serif',
        lineHeight: 2,
        color: '#000',
        background: '#fff',
        padding: '15px',
        maxWidth: '8.5in',
        margin: '0 auto',
      }}
    >
      <style>{`
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
          .question {
            page-break-inside: avoid;
            margin-bottom: 15px;
          }
        }
      `}</style>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          mb: 4,
          pb: 2,
          borderBottom: '2px solid #000',
        }}
      >
        <Box sx={{ fontSize: '10pt', color: '#666' }}>
          www.afringram.com
        </Box>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontSize: '18pt',
              fontWeight: 'bold',
              mb: 1,
              fontFamily: '"B Titr", "B Nazanin", serif',
            }}
          >
            {exam.title}
          </Typography>
        </Box>
        <Box sx={{ fontSize: '11pt' }}>
          نام و نام خانوادگی: <Box component="span" sx={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '150px', px: 1 }} />
        </Box>
      </Box>

      {exam.meta?.instructions && (
        <Box
          sx={{
            background: '#f5f5f5',
            border: '1px solid #ddd',
            padding: 1.5,
            mb: 3,
            fontSize: '10pt',
            borderRadius: '3px',
          }}
        >
          <strong>دستورالعمل:</strong> {exam.meta.instructions.split('\n').map((line, i) => (
            <span key={i}>{line}<br /></span>
          ))}
        </Box>
      )}

      {(exam.exam_questions || []).map((examQuestion, index) => {
        const payload = examQuestion.payload || {};
        const questionText = payload.question_text || 'سوال';
        const questionType = payload.type || 'multiple_choice';
        const isEssayType = isEssay(questionType);
        const typeLabel = getQuestionTypeLabel(questionType);
        const questionNumber = index + 1;
        const points = payload.points ?? exam.meta?.points_per_question ?? 2;

        return (
          <Box
            key={examQuestion.id}
            sx={{
              mb: 2.5,
              padding: 2,
              pageBreakInside: 'avoid',
            }}
          >
            <Box sx={{ fontSize: '11pt', mb: 1.5, textAlign: 'justify', display: 'flex', alignItems: 'start', gap: 1 }}>
              <Box component="span" sx={{ fontWeight: 'bold', fontSize: '12pt', ml: 1, minWidth: '25px', display: 'inline-block' }}>
                {questionNumber}.
              </Box>
              <Box sx={{ flex: 1 }}>
              {questionText.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
              <Box component="span" sx={{ fontSize: '10pt', color: '#666', mr: 1 }}>
                (بارم: {points})
              </Box>
              </Box>
            </Box>

            {isEssayType ? (
              <Box
                sx={{
                  mt: 1.5,
                  minHeight: '100px',
                }}
              />
            ) : (
              payload.options && Array.isArray(payload.options) && (
                <Box
                  sx={{
                    mr: 4,
                    mt: 1.25,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                  }}
                >
                  {payload.options.map((option: any, optionIndex: number) => {
                    const optionText = typeof option === 'string' ? option : (option.text || option);
                    const label = persianLabels[optionIndex] || String.fromCharCode(65 + optionIndex);
                    return (
                      <Box
                        key={optionIndex}
                        sx={{
                          display: 'flex',
                          alignItems: 'start',
                          gap: 0.5,
                          fontSize: '10pt',
                          minWidth: '150px',
                          flex: '1 1 calc(50% - 16px)',
                        }}
                      >
                        <Box component="span" sx={{ fontWeight: 'bold', minWidth: '25px', fontFamily: '"B Nazanin", serif' }}>
                          {label})
                        </Box>
                        <Box component="span" sx={{ flex: 1 }}>
                          {optionText}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )
            )}
          </Box>
        );
      })}
    </Box>
  );
}

