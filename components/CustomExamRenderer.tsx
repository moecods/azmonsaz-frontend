'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  FormGroup,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
// Removed unused imports
import { Question } from './QuestionBankBuilder';

interface ExamAnswer {
  questionId: string;
  answer: unknown;
}

interface CustomExamRendererProps {
  questions: Question[];
  title: string;
  duration?: number; // in minutes
  onComplete?: (answers: ExamAnswer[], score: number, totalPoints: number) => void;
  showResults?: boolean;
  allowReview?: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
}

export default function CustomExamRenderer({
  questions,
  title,
  duration = 60,
  onComplete,
  showResults: _showResults = true,
  allowReview = true,
  shuffleQuestions = false,
  shuffleOptions = false,
}: CustomExamRendererProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(duration * 60); // convert to seconds
  const [isCompleted, setIsCompleted] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shuffledQuestionsState, setShuffledQuestionsState] = useState<Question[]>(questions);
  const [shuffledOptionsCache, setShuffledOptionsCache] = useState<Map<string, string[]>>(new Map());

  // Removed unused form hook

  // Initialize shuffling only on client side after mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    if (shuffleQuestions) {
      // Shuffle questions using Fisher-Yates algorithm for consistency
      const shuffled = [...questions];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setShuffledQuestionsState(shuffled);
    } else {
      setShuffledQuestionsState(questions);
    }
  }, [questions, shuffleQuestions]);

  // Use shuffled questions state or fallback to original questions
  const shuffledQuestions = mounted && shuffleQuestions ? shuffledQuestionsState : questions;

  // Shuffle options if needed - only on client side after mount
  const getShuffledOptions = (options: string[], questionId: string) => {
    if (!shuffleOptions || !options || !mounted) return options;
    
    // Check cache first to ensure consistency
    if (shuffledOptionsCache.has(questionId)) {
      return shuffledOptionsCache.get(questionId)!;
    }
    
    // Shuffle using Fisher-Yates algorithm
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Cache the shuffled result
    setShuffledOptionsCache(prev => new Map(prev).set(questionId, shuffled));
    return shuffled;
  };

  // Submit exam
  const handleSubmitExam = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      // Calculate score
      let totalScore = 0;
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      
      questions.forEach(question => {
        const userAnswer = answers.find(a => a.questionId === question.id);
        if (userAnswer && question.correctAnswer !== undefined) {
          const isCorrect = checkAnswer(question, userAnswer.answer);
          if (isCorrect) {
            totalScore += question.points;
          }
        }
      });

      setScore(totalScore);
      setIsCompleted(true);
      
      if (onComplete) {
        onComplete(answers, totalScore, totalPoints);
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, questions, onComplete]);

  // Check if answer is correct
  const checkAnswer = (question: Question, userAnswer: unknown): boolean => {
    if (question.correctAnswer === undefined) return false;
    
    switch (question.type) {
      case 'multiple_choice':
        return userAnswer === question.correctAnswer;
      case 'multiple_select':
        if (Array.isArray(question.correctAnswer) && Array.isArray(userAnswer)) {
          return JSON.stringify(question.correctAnswer.sort()) === JSON.stringify(userAnswer.sort());
        }
        return false;
      case 'true_false':
        return userAnswer === question.correctAnswer;
      case 'text':
        return userAnswer?.toString().toLowerCase().trim() === question.correctAnswer?.toString().toLowerCase().trim();
      case 'number':
        return Number(userAnswer) === Number(question.correctAnswer);
      default:
        return false;
    }
  };

  // Timer effect
  useEffect(() => {
    if (isCompleted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted, timeLeft, handleSubmitExam]);

  // Format time display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress
  const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;

  // Handle answer change
  const handleAnswerChange = (questionId: string, answer: unknown) => {
    setAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === questionId);
      if (existingIndex >= 0) {
        const newAnswers = [...prev];
        newAnswers[existingIndex] = { questionId, answer };
        return newAnswers;
      } else {
        return [...prev, { questionId, answer }];
      }
    });
  };

  // Navigate to question
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < shuffledQuestions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  // Next question
  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Render question based on type
  const renderQuestion = (question: Question) => {
    const currentAnswer = answers.find(a => a.questionId === question.id);
    const shuffledOptions = getShuffledOptions(question.options || [], question.id || '');

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {currentQuestionIndex + 1}. {question.title}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip label={question.type} size="small" color="primary" />
            <Chip label={question.difficulty} size="small" color="secondary" />
            <Chip label={`${question.points} pts`} size="small" />
          </Box>

          {question.type === 'multiple_choice' && (
            <FormControl component="fieldset">
              <RadioGroup
                value={currentAnswer?.answer || ''}
                onChange={(e) => handleAnswerChange(question.id || '', e.target.value)}
              >
                {shuffledOptions.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {question.type === 'multiple_select' && (
            <FormGroup>
              {shuffledOptions.map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={(currentAnswer?.answer as string[])?.includes(option) || false}
                      onChange={(e) => {
                        const currentValues = (currentAnswer?.answer as string[]) || [];
                        const newValues = e.target.checked
                          ? [...currentValues, option]
                          : currentValues.filter(v => v !== option);
                        handleAnswerChange(question.id || '', newValues);
                      }}
                    />
                  }
                  label={option}
                />
              ))}
            </FormGroup>
          )}

          {question.type === 'true_false' && (
            <FormControl component="fieldset">
              <RadioGroup
                value={currentAnswer?.answer || ''}
                onChange={(e) => handleAnswerChange(question.id || '', e.target.value === 'true')}
              >
                <FormControlLabel value="true" control={<Radio />} label="True" />
                <FormControlLabel value="false" control={<Radio />} label="False" />
              </RadioGroup>
            </FormControl>
          )}

          {question.type === 'text' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              value={currentAnswer?.answer || ''}
              onChange={(e) => handleAnswerChange(question.id || '', e.target.value)}
              placeholder="Enter your answer..."
            />
          )}

          {question.type === 'number' && (
            <TextField
              fullWidth
              type="number"
              value={currentAnswer?.answer || ''}
              onChange={(e) => handleAnswerChange(question.id || '', Number(e.target.value))}
              placeholder="Enter your answer..."
            />
          )}

          {showAnswerKey && question.correctAnswer !== undefined && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="body2" color="success.dark">
                <strong>Correct Answer:</strong> {Array.isArray(question.correctAnswer) 
                  ? question.correctAnswer.join(', ') 
                  : question.correctAnswer.toString()}
              </Typography>
              {question.explanation && (
                <Typography variant="body2" color="success.dark" sx={{ mt: 1 }}>
                  <strong>Explanation:</strong> {question.explanation}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render results
  const renderResults = () => {
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((score / totalPoints) * 100);

    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
          Exam Completed!
        </Typography>
        
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Your Results
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary">
                  {score}/{totalPoints}
                </Typography>
                <Typography variant="body2">Points</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary">
                  {percentage}%
                </Typography>
                <Typography variant="body2">Score</Typography>
              </Box>
            </Box>
            
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{ height: 10, borderRadius: 5, mb: 2 }}
            />
            
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good job!' : 'Keep studying!'}
            </Typography>
          </CardContent>
        </Card>

        {showAnswerKey && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Answer Review
            </Typography>
            {questions.map((question, index) => (
              <Card key={question.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {index + 1}. {question.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={question.type} size="small" color="primary" />
                    <Chip label={`${question.points} pts`} size="small" />
                  </Box>

                  <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="success.dark">
                      <strong>Correct Answer:</strong> {Array.isArray(question.correctAnswer) 
                        ? question.correctAnswer.join(', ') 
                        : question.correctAnswer?.toString()}
                    </Typography>
                    {question.explanation && (
                      <Typography variant="body2" color="success.dark" sx={{ mt: 1 }}>
                        <strong>Explanation:</strong> {question.explanation}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  if (isCompleted) {
    return renderResults();
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimerIcon />
              <Typography variant="h6">
                {formatTime(timeLeft)}
              </Typography>
            </Box>
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
          </Typography>
        </CardContent>
      </Card>

      {/* Question Navigation */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Question Navigation
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {shuffledQuestions.map((_, index) => {
              const isAnswered = answers.some(a => a.questionId === shuffledQuestions[index].id);
              return (
                <Button
                  key={index}
                  variant={index === currentQuestionIndex ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => goToQuestion(index)}
                  sx={{ minWidth: 40 }}
                >
                  {index + 1}
                  {isAnswered && <CheckCircleIcon sx={{ ml: 0.5, fontSize: 16 }} />}
                </Button>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Current Question */}
      {shuffledQuestions.length > 0 && renderQuestion(shuffledQuestions[currentQuestionIndex])}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {allowReview && (
            <Button
              onClick={() => setShowAnswerKey(!showAnswerKey)}
              startIcon={showAnswerKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
            >
              {showAnswerKey ? 'Hide' : 'Show'} Answer Key
            </Button>
          )}
          
          {currentQuestionIndex === shuffledQuestions.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmitExam}
              disabled={isSubmitting}
            >
              Submit Exam
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
