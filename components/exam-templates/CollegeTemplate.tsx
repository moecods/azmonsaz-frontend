"use client";

import { Box, Typography } from '@mui/material';

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

interface CollegeTemplateProps {
  exam: Exam;
}

export default function CollegeTemplate({ exam }: CollegeTemplateProps) {
  return (
    <Box
      sx={{
        fontFamily: '"Times New Roman", "Georgia", serif',
        lineHeight: 1.6,
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
            margin-bottom: 15px;
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
          borderBottom: '2px solid #000',
          pb: 1.875,
          mb: 3.125,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: '18pt',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            mb: 1.25,
          }}
        >
          {exam.title}
        </Typography>

        {exam.meta?.duration_minutes && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 1.25,
              fontSize: '10pt',
              fontWeight: 'normal',
            }}
          >
            <Box>Time: {exam.meta.duration_minutes} minutes</Box>
            {exam.meta?.passing_score && (
              <Box>Passing Score: {exam.meta.passing_score}%</Box>
            )}
            <Box>Total Questions: {exam.exam_questions?.length || 0}</Box>
          </Box>
        )}
      </Box>

      {exam.meta?.instructions && (
        <Box
          sx={{
            border: '1px solid #000',
            padding: 1.5,
            mb: 3.125,
            background: '#f9f9f9',
          }}
        >
          <Typography sx={{ fontWeight: 'bold', mb: 0.6, textDecoration: 'underline' }}>
            Instructions:
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
        const questionText = payload.question_text || 'Question';
        const questionType = payload.type || 'multiple_choice';
        const isEssay = questionType === 'essay';
        const questionNumber = index + 1;

        return (
          <Box
            key={examQuestion.id}
            className="question"
            sx={{
              mb: 2.5,
              padding: 1.875,
              border: '1px solid #ddd',
              pageBreakInside: 'avoid',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'start',
                gap: 1.25,
                mb: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 'bold',
                  fontSize: '12pt',
                  minWidth: '30px',
                }}
              >
                {questionNumber}.
              </Typography>
              <Typography
                sx={{
                  fontSize: '11pt',
                  flex: 1,
                  textAlign: 'justify',
                }}
              >
                {questionText.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: '9pt',
                fontStyle: 'italic',
                color: '#666',
                mt: 0.6,
              }}
            >
              {isEssay
                ? 'Essay Question'
                : questionType === 'multiple_choice'
                ? 'Multiple Choice'
                : questionType === 'multiple_select'
                ? 'Multiple Select'
                : 'True/False'}
            </Typography>

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
                    mt: 1.5,
                    ml: 3.75,
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
                          display: 'flex',
                          alignItems: 'start',
                          gap: 0.75,
                          minWidth: '150px',
                          flex: '1 1 calc(50% - 12px)',
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 'bold',
                            minWidth: '20px',
                            fontSize: '10pt',
                          }}
                        >
                          {String.fromCharCode(65 + optionIndex)}.
                        </Typography>
                        <Typography
                          sx={{
                            flex: 1,
                            fontSize: '10pt',
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

