"use client";

import { Box, Typography, Chip } from '@mui/material';

interface Exam {
  id: number;
  title: string;
  meta?: {
    duration_minutes?: number;
    passing_score?: number;
    instructions?: string;
  };
  exam_questions?: Array<{
    id: number;
    payload?: any;
  }>;
}

interface PersianCollegeTemplateProps {
  exam: Exam;
}

export default function PersianCollegeTemplate({ exam }: PersianCollegeTemplateProps) {
  const persianLabels = ['الف', 'ب', 'ج', 'د', 'ه', 'و'];

  return (
    <Box
      sx={{
        fontFamily: '"B Nazanin", "Tahoma", "Arial", sans-serif',
        lineHeight: 2.5,
        color: '#000',
        background: '#fff',
        padding: '20px',
        maxWidth: '8.5in',
        margin: '0 auto',
        padding: '1in',
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
            border: 1px solid #000;
            margin-bottom: 20px;
          }
          .exam-header {
            page-break-after: avoid;
          }
          .question:not(:first-child) {
            page-break-before: auto;
          }
        }
      `}</style>

      <Box
        sx={{
          textAlign: 'center',
          borderBottom: '3px solid #000',
          pb: 2.5,
          mb: 3.75,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: '20pt',
            fontWeight: 'bold',
            mb: 1.875,
            fontFamily: '"B Titr", "B Nazanin", serif',
          }}
        >
          {exam.title}
        </Typography>

        {exam.meta?.duration_minutes && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-around',
              mt: 1.875,
              fontSize: '11pt',
              fontWeight: 'normal',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <span>⏱</span>
              <span>زمان: {exam.meta.duration_minutes} دقیقه</span>
            </Box>
            {exam.meta?.passing_score && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <span>✓</span>
                <span>نمره قبولی: {exam.meta.passing_score}%</span>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <span>📝</span>
              <span>تعداد سوالات: {exam.exam_questions?.length || 0}</span>
            </Box>
          </Box>
        )}
      </Box>

      {exam.meta?.instructions && (
        <Box
          sx={{
            border: '2px solid #000',
            padding: 1.875,
            mb: 3.125,
            background: '#f9f9f9',
            borderRadius: '5px',
          }}
        >
          <Typography
            sx={{
              fontWeight: 'bold',
              mb: 1.25,
              fontSize: '12pt',
              textDecoration: 'underline',
            }}
          >
            📋 دستورالعمل آزمون:
          </Typography>
          <Typography>
            {exam.meta.instructions.split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </Typography>
        </Box>
      )}

      {(exam.exam_questions || []).map((examQuestion, index) => {
        const payload = examQuestion.payload || {};
        const questionText = payload.question_text || 'سوال';
        const questionType = payload.type || 'multiple_choice';
        const isEssay = questionType === 'essay';
        const questionNumber = index + 1;

        return (
          <Box
            key={examQuestion.id}
            className="question"
            sx={{
              mb: 3.125,
              padding: 2.5,
              border: '1px solid #333',
              borderRight: isEssay ? '5px solid #000' : '4px solid #000',
              pageBreakInside: 'avoid',
              background: isEssay ? '#fffef0' : '#fafafa',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'start',
                gap: 1.875,
                mb: 1.875,
              }}
            >
              <Box
                sx={{
                  background: isEssay ? '#333' : '#000',
                  color: 'white',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14pt',
                  flexShrink: 0,
                  fontFamily: '"B Titr", serif',
                }}
              >
                {questionNumber}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '12pt',
                    flex: 1,
                    textAlign: 'justify',
                    fontWeight: 500,
                  }}
                >
                  {questionText.split('\n').map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </Typography>
                <Chip
                  label={
                    isEssay
                      ? 'تشریحی'
                      : questionType === 'multiple_choice'
                      ? 'چند گزینه‌ای'
                      : questionType === 'multiple_select'
                      ? 'چند انتخابی'
                      : 'صحیح/غلط'
                  }
                  size="small"
                  sx={{
                    display: 'inline-block',
                    background: '#666',
                    color: 'white',
                    padding: '3px 10px',
                    borderRadius: '3px',
                    fontSize: '9pt',
                    mt: 1,
                    height: 'auto',
                  }}
                />
              </Box>
            </Box>

            {isEssay ? (
              <Box
                sx={{
                  minHeight: '200px',
                  mt: 1.875,
                }}
              />
            ) : (
              payload.options && Array.isArray(payload.options) && (
                <Box
                  sx={{
                    mt: 1.875,
                    mr: 5,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1.5,
                  }}
                >
                  {payload.options.map((option: any, optionIndex: number) => {
                    const optionText = typeof option === 'string' ? option : (option.text || option);
                    const label = persianLabels[optionIndex] || String.fromCharCode(65 + optionIndex);
                    return (
                      <Box
                        key={optionIndex}
                        sx={{
                          padding: 1,
                          border: '1px solid #ddd',
                          background: 'white',
                          display: 'flex',
                          alignItems: 'start',
                          gap: 1.25,
                          minWidth: '160px',
                          flex: '1 1 calc(50% - 12px)',
                        }}
                      >
                        <Box
                          sx={{
                            background: '#000',
                            color: 'white',
                            width: '25px',
                            height: '25px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            flexShrink: 0,
                            fontSize: '10pt',
                          }}
                        >
                          {label}
                        </Box>
                        <Typography
                          sx={{
                            flex: 1,
                            fontSize: '11pt',
                          }}
                        >
                          {optionText}
                        </Typography>
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

