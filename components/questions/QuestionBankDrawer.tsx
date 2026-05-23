"use client";

import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { questionTypeBorderSx } from '@/lib/question-types/type-appearance';
import { QuestionTypeChip } from '@/components/questions/QuestionTypeChip';
import { useQuestions, useQuestionCategories } from '@/hooks';
import QuestionDisplay from '@/components/questions/QuestionDisplay';
import { Question, ExamQuestion, Difficulty, PaginatedResponse } from '@/types';
import { DIFFICULTY_CONFIG } from '@/constants/question';

interface QuestionBankDrawerProps {
  open?: boolean;
  onClose?: () => void;
  onAddQuestion: (question: ExamQuestion) => void;
  /** When false, drawer stays open after add (split-pane / desktop bank). */
  closeOnAdd?: boolean;
  /** embedded = inline panel (desktop split); drawer = overlay */
  variant?: "drawer" | "embedded";
  defaultPoints?: number;
  /** Optional: search term and filters controlled by parent */
  initialSearch?: string;
  initialCategory?: number | '';
  initialDifficulty?: Difficulty | '';
}

export default function QuestionBankDrawer({
  open = true,
  onClose = () => {},
  onAddQuestion,
  closeOnAdd = true,
  variant = "drawer",
  defaultPoints = 1,
  initialSearch = '',
  initialCategory = '',
  initialDifficulty = '',
}: QuestionBankDrawerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<number | ''>(initialCategory);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | ''>(initialDifficulty);

  const { data: questionsData, isLoading: questionsLoading } = useQuestions({
    search: searchTerm || undefined,
    category_id: selectedCategory || undefined,
    difficulty: selectedDifficulty || undefined,
    per_page: 50,
  });

  const { data: categoriesData } = useQuestionCategories();

  const questions: Question[] = (questionsData as PaginatedResponse<Question>)?.data ?? [];
  const categories = categoriesData ?? [];

  const stats = useMemo(() => {
    const total = questions.length;
    const totalPoints = total * defaultPoints;
    return { total, totalPoints };
  }, [questions, defaultPoints]);

  const handleAddFromBank = (question: Question) => {
    const examQuestion: ExamQuestion = {
      id: Date.now(),
      exam_id: 0,
      question_id: question.id,
      question,
      order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onAddQuestion(examQuestion);
    if (closeOnAdd) onClose();
  };

  const panel = (
      <Box
        sx={{
          height: variant === "embedded" ? "100%" : "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: variant === "embedded" ? 400 : undefined,
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}
        >
          <Typography variant="h6">بانک سوالات</Typography>
          {variant === "drawer" && (
            <IconButton onClick={onClose} size="small" aria-label="بستن">
              <CloseIcon />
            </IconButton>
          )}
        </Stack>

        {/* Stats (bank list) */}
        <Box sx={{ px: 2, py: 1.5, bgcolor: 'action.hover', borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`تعداد: ${stats.total}`} size="small" color="primary" variant="outlined" />
            <Chip
              label={`مجموع بارم (اگر همه اضافه شوند): ${stats.totalPoints}`}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Box>

        {/* Search & Filters */}
        <Stack spacing={1.5} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            size="small"
            label="جستجوی سوالات"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
            }}
          />
          <Stack direction="row" spacing={1}>
            <FormControl size="small" fullWidth>
              <InputLabel>دسته‌بندی</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as number | '')}
                label="دسته‌بندی"
              >
                <MenuItem value="">همه</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>سطح سختی</InputLabel>
              <Select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty | '')}
                label="سطح سختی"
              >
                <MenuItem value="">همه</MenuItem>
                <MenuItem value="easy">آسان</MenuItem>
                <MenuItem value="medium">متوسط</MenuItem>
                <MenuItem value="hard">سخت</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        {/* List */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {questionsLoading ? (
            <Stack alignItems="center" justifyContent="center" py={4}>
              <CircularProgress />
            </Stack>
          ) : questions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
              سوالی یافت نشد
            </Typography>
          ) : (
            <Stack spacing={2}>
              {questions.map((question) => {
                const questionType = question.type || 'multiple_choice';
                const questionDifficulty = (question.difficulty || 'medium') as Difficulty;
                const questionCategory = question.category;
                const diffCfg = DIFFICULTY_CONFIG[questionDifficulty];

                return (
                  <Card
                    key={question.id}
                    variant="outlined"
                    sx={(t) => ({
                      overflow: 'visible',
                      ...questionTypeBorderSx(t, questionType),
                    })}
                  >
                    <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                      <QuestionDisplay source={question} mode="bank" compact />

                      <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mt: 1.5 }}>
                        {diffCfg && (
                          <Chip label={diffCfg.label} size="small" color={diffCfg.color} />
                        )}
                        {questionCategory?.name && (
                          <Chip label={questionCategory.name} size="small" variant="outlined" />
                        )}
                        <QuestionTypeChip type={questionType} />
                        <Chip label={`بارم: ${defaultPoints}`} size="small" variant="outlined" />
                      </Stack>
                      <Button
                        size="small"
                        variant="contained"
                        fullWidth
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => handleAddFromBank(question)}
                        sx={{ mt: 1.5 }}
                      >
                        افزودن به آزمون
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Box>
      </Box>
  );

  if (variant === "embedded") {
    return panel;
  }

  return (
    <Drawer
      anchor={isMobile ? "bottom" : "right"}
      open={open}
      onClose={onClose}
      variant="temporary"
      PaperProps={{
        sx: {
          width: isMobile ? "100%" : 420,
          maxWidth: "100%",
          maxHeight: isMobile ? "92vh" : "100%",
          borderTopLeftRadius: isMobile ? 16 : 0,
          borderTopRightRadius: isMobile ? 16 : 0,
        },
      }}
    >
      {panel}
    </Drawer>
  );
}
