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

interface ModernTemplateProps {
  exam: Exam;
}

export default function ModernTemplate({ exam }: ModernTemplateProps) {
  return (
    <Box
      sx={{
        fontFamily: '"Vazir", "Tahoma", sans-serif',
        lineHeight: 2,
        color: '#2c3e50',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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
            border-left: 3px solid #667eea;
            margin-bottom: 20px;
          }
          .exam-header {
            page-break-after: avoid;
            background: #667eea !important;
          }
          .question:not(:first-child) {
            page-break-before: auto;
          }
        }
      `}</style>

      <Box
        sx={{
          maxWidth: '1000px',
          margin: '0 auto',
          background: 'white',
          padding: '50px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          borderRadius: '10px',
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '30px',
            borderRadius: '10px',
            mb: 3.75,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontSize: '32px',
              fontWeight: 'bold',
              mb: 1.875,
            }}
          >
            {exam.title}
          </Typography>

          {exam.meta?.duration_minutes && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 3.75,
                mt: 1.875,
                fontSize: '14px',
                opacity: 0.9,
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
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              padding: '20px',
              mb: 3.75,
              borderRadius: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            }}
          >
            <Typography sx={{ fontWeight: 'bold', mb: 1.25, fontSize: '16px' }}>
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
                padding: 3.125,
                background: isEssay ? '#fff5f5' : '#f8f9fa',
                borderRadius: '10px',
                borderLeft: isEssay ? '5px solid #ff6b6b' : '5px solid #667eea',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                pageBreakInside: 'avoid',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                },
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
                    background: isEssay
                      ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    flexShrink: 0,
                    boxShadow: '0 4px 10px rgba(102, 126, 234, 0.3)',
                  }}
                >
                  {questionNumber}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '16px',
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
                      background: '#ff6b6b',
                      color: 'white',
                      padding: '5px 15px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      mt: 1,
                      height: 'auto',
                    }}
                  />
                </Box>
              </Box>

              {isEssay ? (
                <Box
                  sx={{
                    minHeight: '150px',
                    mt: 1.875,
                  }}
                />
              ) : (
                payload.options && Array.isArray(payload.options) && (
                  <Box
                    sx={{
                      mt: 2.5,
                      mr: 5.625,
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
                            padding: 1.5,
                            background: 'white',
                            border: '2px solid #e0e0e0',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            transition: 'all 0.2s',
                            minWidth: '200px',
                            flex: '1 1 calc(50% - 12px)',
                            '&:hover': {
                              borderColor: '#667eea',
                              background: '#f0f4ff',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                              color: 'white',
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              flexShrink: 0,
                              boxShadow: '0 2px 8px rgba(79, 172, 254, 0.3)',
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

