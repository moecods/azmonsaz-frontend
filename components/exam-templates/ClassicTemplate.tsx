"use client";

import { Box, Typography } from '@mui/material';
import { isEssay, getQuestionTypeLabel } from '@/lib/question-types';
import { getExamDurationMinutes, getExamPassingScore, getExamInstructions, getExamPointsPerQuestion } from '@/lib/exam-utils';
import { RichLabel } from '@/components/editor';
import type { Exam } from '@/types';

interface ExamWithPayload extends Exam {
  exam_questions?: Array<{ id: number; payload?: any }>;
}

interface ClassicTemplateProps {
  exam: ExamWithPayload;
}

export default function ClassicTemplate({ exam }: ClassicTemplateProps) {
  const durationMinutes = getExamDurationMinutes(exam);
  const passingScore = getExamPassingScore(exam);
  const instructions = getExamInstructions(exam);
  const pointsPerQuestion = getExamPointsPerQuestion(exam);
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

        {durationMinutes && (
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
                <RichLabel html={questionText} fontSize="15px" />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.6 }}>
                  <Typography
                    sx={{
                      fontSize: '11px',
                      color: '#666',
                      fontStyle: 'italic',
                    }}
                  >
                    {typeLabel}
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: '#666' }}>
                    | بارم: {points}
                  </Typography>
                </Box>
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
                        <RichLabel html={optionText} fontSize="14px" sx={{ flex: 1 }} />
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

