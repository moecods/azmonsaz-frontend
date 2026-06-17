'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import { useToast } from '@/hooks/useToast';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { dialogTransitionProps } from '@/theme/motion';
import {
  Preview as PreviewIcon,
  Quiz as QuizIcon,
} from '@mui/icons-material';
import CustomExamBuilder from '@/components/CustomExamBuilder';
import CustomExamRenderer from '@/components/CustomExamRenderer';
import CustomPDFExport from '@/components/CustomPDFExport';
import { Question } from '@/components/QuestionBankBuilder';

interface Exam {
  id?: string;
  title: string;
  description?: string;
  subject: string;
  duration: number;
  totalPoints: number;
  instructions?: string;
  questions: Question[];
  settings: {
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showCorrectAnswers: boolean;
    allowReview: boolean;
    timeLimit: boolean;
  };
}

export default function CustomExamPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [exam, setExam] = useState<Exam | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const toast = useToast();
  const reducedMotion = useReducedMotion();

  const handleSaveExam = (savedExam: Exam) => {
    setExam(savedExam);
    toast.success('Exam saved successfully!');
  };

  const handlePreviewExam = () => {
    if (exam && exam.questions.length > 0) {
      setIsPreviewOpen(true);
    } else {
      toast.warning('Please create an exam with questions first.');
    }
  };

  const handleExamComplete = (answers: unknown[], score: number, totalPoints: number) => {
    toast.info(
      `Exam completed! Score: ${score}/${totalPoints} (${Math.round((score / totalPoints) * 100)}%)`
    );
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <QuizIcon fontSize="large" />
          Custom Exam Builder
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create exams using our custom question bank system.
        </Typography>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Create Exam" />
            <Tab label="Preview" disabled={!exam || exam.questions.length === 0} />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              <CustomExamBuilder
                onSave={handleSaveExam}
                title=""
                showPreview={true}
              />
            </Box>
          )}

          {activeTab === 1 && exam && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">
                  Exam Preview
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <CustomPDFExport
                    questions={exam.questions}
                    title={exam.title}
                    filename={`${exam.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`}
                    onExportComplete={(_url) => {
                      toast.success('PDF exported successfully!');
                    }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<PreviewIcon />}
                    onClick={handlePreviewExam}
                  >
                    Take Exam
                  </Button>
                </Box>
              </Box>

              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {exam.title}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {exam.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Subject:</strong> {exam.subject}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Duration:</strong> {exam.duration} minutes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Questions:</strong> {exam.questions.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Total Points:</strong> {exam.totalPoints}
                    </Typography>
                  </Box>
                  {exam.instructions && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>Instructions:</strong> {exam.instructions}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Questions ({exam.questions.length})
              </Typography>
              {exam.questions.map((question, index) => (
                <Card key={question.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {index + 1}. {question.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Typography variant="body2" color="primary">
                        {question.type}
                      </Typography>
                      <Typography variant="body2" color="secondary">
                        {question.difficulty}
                      </Typography>
                      <Typography variant="body2">
                        {question.points} points
                      </Typography>
                    </Box>
                    {question.options && question.options.length > 0 && (
                      <Box>
                        {question.options.map((option, optIndex) => (
                          <Typography key={optIndex} variant="body2" sx={{ ml: 2 }}>
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog
        open={isPreviewOpen}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
        TransitionProps={dialogTransitionProps(reducedMotion)}
      >
        <DialogTitle>
          {exam?.title} - Exam Preview
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {exam && (
            <CustomExamRenderer
              questions={exam.questions}
              title={exam.title}
              duration={exam.duration}
              onComplete={handleExamComplete}
              showResults={true}
              allowReview={exam.settings.allowReview}
              shuffleQuestions={exam.settings.shuffleQuestions}
              shuffleOptions={exam.settings.shuffleOptions}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>
            Close Preview
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
