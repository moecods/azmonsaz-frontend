"use client";

import { Box, Typography, Chip } from '@mui/material';
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

interface DefaultTemplateProps {
  exam: Exam;
}

export default function DefaultTemplate({ exam }: DefaultTemplateProps) {
  return (
    <Box
      sx={{
        fontFamily: '"Tahoma", "Arial", sans-serif',
        lineHeight: 1.8,
        color: '#333',
        background: '#f5f5f5',
        padding: '20px',
        minHeight: '100vh',
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
          maxWidth: '900px',
          margin: '0 auto',
          background: 'white',
          padding: '40px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            borderBottom: '3px solid #2196F3',
            pb: 2.5,
            mb: 3.75,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#1976D2',
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
              background: '#E3F2FD',
              borderRight: '4px solid #2196F3',
              padding: 1.875,
              mb: 3.75,
              borderRadius: '5px',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976D2', mb: 1 }}>
              📋 دستورالعمل آزمون:
            </Typography>
            <Typography variant="body2">
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
          const isEssayType = isEssay(questionType);
          const typeLabel = getQuestionTypeLabel(questionType);
          const questionNumber = index + 1;

          return (
            <Box
              key={examQuestion.id}
              className="question"
              sx={{
                mb: 3.75,
                padding: 2.5,
                border: isEssayType ? '2px solid #FF9800' : '2px solid #E0E0E0',
                borderRadius: '8px',
                background: isEssayType ? '#FAFAFA' : '#FAFAFA',
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
                    background: isEssayType ? '#FF9800' : '#2196F3',
                    color: 'white',
                    width: '35px',
                    height: '35px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}
                >
                  {questionNumber}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#212121',
                    }}
                  >
                    {questionText.split('\n').map((line, i) => (
                      <span key={i}>{line}<br /></span>
                    ))}
                  </Typography>
                  <Chip
                    label={
                      typeLabel
                    }
                    size="small"
                    sx={{
                      background: '#FF9800',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      mt: 0.6,
                      height: 'auto',
                    }}
                  />
                </Box>
              </Box>

              {isEssayType ? (
                <Box
                  sx={{
                    minHeight: '100px',
                    mt: 1.875,
                  }}
                />
              ) : (
                payload.options && Array.isArray(payload.options) && (
                  <Box
                    sx={{
                      mt: 1.875,
                      pr: 2.5,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1.5,
                    }}
                  >
                    {payload.options.map((option: any, optionIndex: number) => {
                      const optionText = typeof option === 'string' ? option : (option.text || option);
                      return (
                        <Box
                          key={optionIndex}
                          sx={{
                            padding: 1.25,
                            background: 'white',
                            border: '1px solid #E0E0E0',
                            borderRadius: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                            minWidth: '180px',
                            flex: '1 1 calc(50% - 12px)',
                          }}
                        >
                          <Box
                            sx={{
                              background: '#4CAF50',
                              color: 'white',
                              width: '25px',
                              height: '25px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
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
    </Box>
  );
}

