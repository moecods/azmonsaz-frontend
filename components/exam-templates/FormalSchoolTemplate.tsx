"use client";

import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

interface Exam {
  id: number;
  title: string;
  partner_id?: number;
  meta?: {
    duration_minutes?: number;
    passing_score?: number;
    instructions?: string;
  };
  exam_questions?: Array<{
    id: number;
    payload?: any;
  }>;
  partner?: {
    name?: string;
  };
}

interface FormalSchoolTemplateProps {
  exam: Exam;
}

export default function FormalSchoolTemplate({ exam }: FormalSchoolTemplateProps) {
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
          .questions-table tr {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 3,
          border: '2px solid #000',
          padding: 2,
        }}
      >
        <Box sx={{ width: '30%', borderLeft: '1px solid #000', pr: 1.25 }}>
          <Box component="label" sx={{ display: 'block', mb: 1, fontSize: '10pt' }}>نام:</Box>
          <Box sx={{ mb: 1.5, minHeight: '20px' }} />
          <Box component="label" sx={{ display: 'block', mb: 1, fontSize: '10pt' }}>نام خانوادگی:</Box>
          <Box sx={{ mb: 1.5, minHeight: '20px' }} />
          <Box component="label" sx={{ display: 'block', mb: 1, fontSize: '10pt' }}>کلاس:</Box>
          <Box sx={{ mb: 1.5, minHeight: '20px' }} />
          <Box component="label" sx={{ display: 'block', mb: 1, fontSize: '10pt' }}>پایه:</Box>
          <Box sx={{ mb: 1.5, minHeight: '20px' }} />
        </Box>

        <Box sx={{ width: '40%', textAlign: 'center', px: 1.25 }}>
          <Typography
            sx={{
              fontSize: '14pt',
              fontWeight: 'bold',
              mb: 2,
              fontFamily: '"B Titr", serif',
            }}
          >
            باسمه تعالی
          </Typography>
          <Box
            sx={{
              fontSize: '11pt',
              fontWeight: 'bold',
              mt: 1.25,
              borderBottom: '1px solid #000',
              pb: 0.6,
              display: 'inline-block',
              minWidth: '200px',
            }}
          >
            {exam.partner?.name || 'اسم مدرسه مدنظر شما'}
          </Box>
          <Box sx={{ fontSize: '10pt', mt: 1.25 }}>
            درس اول تا دهم
          </Box>
        </Box>

        <Box sx={{ width: '30%', borderRight: '1px solid #000', pr: 1.25 }}>
          <Box component="label" sx={{ display: 'block', mb: 1, fontSize: '10pt' }}>تاریخ امتحان:</Box>
          <Box sx={{ mb: 1.5, minHeight: '20px' }} />
          <Box component="label" sx={{ display: 'block', mb: 1, fontSize: '10pt' }}>وقت امتحان:</Box>
          <Box sx={{ mb: 1.5, minHeight: '20px' }} />
          <Box component="label" sx={{ display: 'block', mb: 1, fontSize: '10pt' }}>نام دبیر:</Box>
          <Box sx={{ mb: 1.5, minHeight: '20px' }} />
        </Box>
      </Box>

      <Table
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          mt: 2.5,
          '& th, & td': {
            border: '1px solid #000',
            padding: 1.25,
            textAlign: 'center',
            verticalAlign: 'top',
          },
          '& th': {
            background: '#f0f0f0',
            fontWeight: 'bold',
            fontSize: '11pt',
          },
        }}
        className="questions-table"
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '60px', fontWeight: 'bold', fontSize: '12pt' }}>ردیف</TableCell>
            <TableCell>سوالات</TableCell>
            <TableCell sx={{ width: '80px', fontSize: '14pt', fontWeight: 'bold' }}>بارم</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(exam.exam_questions || []).map((examQuestion, index) => {
            const payload = examQuestion.payload || {};
            const questionText = payload.question_text || 'سوال';
            const questionType = payload.type || 'multiple_choice';
            const isEssay = questionType === 'essay';
            const questionNumber = index + 1;
            const points = payload.points || 2;

            return (
              <TableRow key={examQuestion.id}>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '12pt' }}>
                  {questionNumber}
                </TableCell>
                <TableCell sx={{ textAlign: 'right', padding: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ fontSize: '11pt', mb: 1.25, textAlign: 'justify' }}>
                      {questionText.split('\n').map((line, i) => (
                        <span key={i}>{line}<br /></span>
                      ))}
                    </Box>

                    {isEssay ? (
                      <Box
                        sx={{
                          minHeight: '80px',
                          mt: 1.25,
                        }}
                      />
                    ) : (
                      payload.options && Array.isArray(payload.options) && (
                        <Box
                          sx={{
                            mr: 2.5,
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
                                  display: 'flex',
                                  alignItems: 'start',
                                  gap: 0.5,
                                  fontSize: '10pt',
                                  minWidth: '120px',
                                  flex: '1 1 calc(50% - 12px)',
                                }}
                              >
                                <Box component="span" sx={{ fontWeight: 'bold', minWidth: '20px', fontFamily: '"B Nazanin", serif' }}>
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
                </TableCell>
                <TableCell sx={{ fontSize: '14pt', fontWeight: 'bold' }}>
                  <Box sx={{ borderTop: '1px solid #000', paddingTop: 0.6 }}>
                    {points}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}

