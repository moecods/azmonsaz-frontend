"use client";

import { Box, Typography, Chip } from '@mui/material';
import { isEssay, getQuestionTypeLabel } from '@/lib/question-types';
import { getExamDurationMinutes, getExamPassingScore, getExamInstructions, getExamPointsPerQuestion } from '@/lib/exam-utils';
import type { Exam } from '@/types';

interface ExamWithPayload extends Exam {
  exam_questions?: Array<{ id: number; payload?: any }>;
}

interface PersianCollegeTemplateProps {
  exam: ExamWithPayload;
}

export default function PersianCollegeTemplate({ exam }: PersianCollegeTemplateProps) {
  const persianLabels = ['الف', 'ب', 'ج', 'د', 'ه', 'و'];
  const durationMinutes = getExamDurationMinutes(exam);
  const passingScore = getExamPassingScore(exam);
  const instructions = getExamInstructions(exam);
  const pointsPerQuestion = getExamPointsPerQuestion(exam);

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

        {durationMinutes && (
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
              <span>زمان: {durationMinutes} دقیقه</span>
            </Box>
            {passingScore && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <span>✓</span>
                <span>نمره قبولی: {passingScore}%</span>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <span>📝</span>
              <span>تعداد سوالات: {exam.exam_questions?.length || 0}</span>
            </Box>
          </Box>
        )}
      </Box>

      {instructions && (
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
            {instructions.split('\n').map((line, i) => (
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
        const points = payload.points ?? pointsPerQuestion ?? 2;

        return (
          <Box
            key={examQuestion.id}
            className="question"
            sx={{
              mb: 3.125,
              padding: 2.5,
              border: '1px solid #333',
              borderRight: isEssayType ? '5px solid #000' : '4px solid #000',
              pageBreakInside: 'avoid',
              background: isEssayType ? '#fffef0' : '#fafafa',
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
                  background: isEssayType ? '#333' : '#000',
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
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={typeLabel}
                    size="small"
                    sx={{
                      display: 'inline-block',
                      background: '#666',
                      color: 'white',
                      padding: '3px 10px',
                      borderRadius: '3px',
                      fontSize: '9pt',
                      height: 'auto',
                    }}
                  />
                  <Chip
                    label={`بارم: ${points}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '9pt', height: 'auto' }}
                  />
                </Box>
              </Box>
            </Box>

            {isEssayType ? (
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

