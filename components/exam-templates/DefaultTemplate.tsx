"use client";

import { Box, Typography } from '@mui/material';
import { getExamDurationMinutes, getExamPassingScore, getExamInstructions, getExamPointsPerQuestion } from '@/lib/exam-utils';
import QuestionPrintBlock from '@/components/questions/QuestionPrintBlock';
import type { Exam } from '@/types';

interface ExamWithPayload extends Exam {
  exam_questions?: Array<{
    id: number;
    payload?: any;
  }>;
}

interface DefaultTemplateProps {
  exam: ExamWithPayload;
}

export default function DefaultTemplate({ exam }: DefaultTemplateProps) {
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

          {durationMinutes != null && (
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
              {passingScore != null && (
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
              {instructions.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </Typography>
          </Box>
        )}

        {(exam.exam_questions || []).map((examQuestion, index) => {
          const payload = examQuestion.payload || {};
          const questionNumber = index + 1;
          const points = payload.points ?? pointsPerQuestion ?? 2;

          return (
            <QuestionPrintBlock
              key={examQuestion.id}
              questionNumber={questionNumber}
              source={payload as Record<string, unknown>}
              points={points as number}
            />
          );
        })}
      </Box>
    </Box>
  );
}

