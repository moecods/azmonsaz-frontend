"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { dataService } from '@/lib/data-service';
import { queryKeys } from '@/lib/query-client';
import { Exam } from '@/types';
import SchoolIcon from '@mui/icons-material/School';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import QuizIcon from '@mui/icons-material/Quiz';
import { useRouter } from 'next/navigation';

export default function ExamsPage() {
  const router = useRouter();
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  // Note: In a real implementation, you would fetch exams from the API
  // For now, we'll show a placeholder since we don't have an endpoint for listing all exams
  const { data: examsData, isLoading: examsLoading, error } = useQuery({
    queryKey: ['exams-list'],
    queryFn: async () => {
      // This would be replaced with actual API call
      // return dataService.getExams();
      return { data: [] };
    },
  });

  const handleEditExam = (exam: Exam) => {
    // Generate deep link for exam editing
    const deepLink = `/exams/create?partner_id=${exam.partner_id}&callback_url=${encodeURIComponent(exam.partner?.callback_url || '')}&exam_id=${exam.id}`;
    router.push(deepLink);
  };

  const handleDownloadPDF = (exam: Exam) => {
    if (exam.pdf_url) {
      window.open(exam.pdf_url, '_blank');
    }
  };

  const exams: Exam[] = examsData?.data || [];

  if (examsLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load exams. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" gutterBottom>
            All Exams
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            View and manage all created exams.
          </Typography>
          
          {/* Quick Actions */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/exams/custom')}
              sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              Create Custom Exam
            </Button>
            <Button
              variant="outlined"
              startIcon={<QuizIcon />}
              onClick={() => router.push('/exams/create')}
            >
              Traditional Builder
            </Button>
          </Box>
        </Box>

        {exams.length === 0 ? (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No exams created yet
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Start by creating your first exam using our custom builder or partner websites.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={() => router.push('/exams/custom')}
                    startIcon={<AddIcon />}
                    sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
                  >
                    Create Custom Exam
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/partners')}
                    startIcon={<SchoolIcon />}
                  >
                    Use Partner Sites
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: 3 
            }}
          >
            {exams.map((exam) => (
              <Card 
                key={exam.id}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <SchoolIcon color="primary" />
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {exam.title}
                      </Typography>
                      <Chip 
                        label={exam.status} 
                        color={
                          exam.status === 'completed' ? 'success' :
                          exam.status === 'published' ? 'primary' : 'default'
                        }
                        size="small"
                      />
                    </Stack>

                    {exam.description && (
                      <Typography variant="body2" color="text.secondary">
                        {exam.description}
                      </Typography>
                    )}

                    {exam.subject && (
                      <Typography variant="body2" color="text.secondary">
                        Subject: {exam.subject}
                      </Typography>
                    )}

                    <Typography variant="body2" color="text.secondary">
                      Questions: {exam.questions?.length || 0}
                    </Typography>

                    {exam.partner && (
                      <Typography variant="body2" color="text.secondary">
                        Partner: {exam.partner.name}
                      </Typography>
                    )}

                    <Typography variant="body2" color="text.secondary">
                      Created: {new Date(exam.created_at).toLocaleDateString()}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleEditExam(exam)}
                        startIcon={<EditIcon />}
                      >
                        Edit
                      </Button>
                      {exam.pdf_url && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleDownloadPDF(exam)}
                          startIcon={<DownloadIcon />}
                        >
                          PDF
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">
                Exam Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Create new exams using partner websites
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Edit existing exams to modify questions and settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Download PDF versions of completed exams
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Track exam status and completion
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
