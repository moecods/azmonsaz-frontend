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
  };
  exam_questions?: Array<{
    id: number;
    payload?: any;
  }>;
}

interface ClassicTemplateProps {
  exam: Exam;
}

export default function ClassicTemplate({ exam }: ClassicTemplateProps) {
  return (
    <Box
      sx={{
        fontFamily: '"Tahoma", "Arial", sans-serif',
        lineHeight: 1.8,
        color: '#333',
        background: '#fff',
        padding: '20px',
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px',
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
            border: 1px solid #ccc;
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
          borderBottom: '2px solid #333',
          pb: 2.5,
          mb: 3.75,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#333',
            mb: 1.25,
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
              fontSize: '14px',
              color: '#666',
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
            background: '#f0f0f0',
            border: '1px solid #ccc',
            padding: 1.875,
            mb: 3.75,
          }}
        >
          <Typography sx={{ fontWeight: 'bold', mb: 1 }}>
            📋 دستورالعمل آزمون:
          </Typography>
          <Typography>
            {exam.meta.instructions.split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </Typography>
        </Box>
      )}

      {exam.exam_questions.map((examQuestion, index) => {
        const payload = examQuestion.payload || {};
        const questionText = payload.question_text || 'سوال';
        const questionType = payload.type || 'multiple_choice';
        const isEssayType = isEssay(questionType);
        const typeLabel = getQuestionTypeLabel(questionType);
        const questionNumber = index + 1;

        return (
          <Box
            key={examQuestion.id}
            className="question"
            sx={{
              mb: 3.125,
              padding: 1.875,
              border: '1px solid #ddd',
              background: isEssayType ? '#fffef0' : '#fafafa',
              pageBreakInside: 'avoid',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'start',
                gap: 1.25,
                mb: 1.875,
              }}
            >
              <Box
                sx={{
                  background: isEssayType ? '#666' : '#333',
                  color: 'white',
                  width: '30px',
                  height: '30px',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  flexShrink: 0,
                }}
              >
                {questionNumber}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '15px',
                  }}
                >
                  {questionText.split('\n').map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '11px',
                    color: '#666',
                    mt: 0.6,
                    fontStyle: 'italic',
                  }}
                >
                  {typeLabel}
                </Typography>
              </Box>
            </Box>

            {isEssayType ? (
              <Box
                sx={{
                  minHeight: '120px',
                  mt: 1.875,
                }}
              />
            ) : (
              payload.options && Array.isArray(payload.options) && (
                <Box
                  sx={{
                    mt: 1.875,
                    mr: 3.75,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1.25,
                  }}
                >
                  {payload.options.map((option: any, optionIndex: number) => {
                    const optionText = typeof option === 'string' ? option : (option.text || option);
                    return (
                      <Box
                        key={optionIndex}
                        sx={{
                          padding: 1,
                          background: 'white',
                          border: '1px solid #ddd',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.25,
                          minWidth: '150px',
                          flex: '1 1 calc(50% - 10px)',
                        }}
                      >
                        <Box
                          sx={{
                            background: '#666',
                            color: 'white',
                            width: '22px',
                            height: '22px',
                            borderRadius: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            flexShrink: 0,
                          }}
                        >
                          {String.fromCharCode(65 + optionIndex)}
                        </Box>
                        <Typography sx={{ flex: 1, fontSize: '14px' }}>
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

