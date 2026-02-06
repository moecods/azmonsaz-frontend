"use client";

import { Box, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth, useExams, useAvailableExams, useQuestions } from "@/hooks";
import { useMemo } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Fetch data for statistics
  const { data: examsData, isLoading: examsLoading } = useExams({ per_page: 100 });
  const { data: availableExamsData, isLoading: availableExamsLoading } = useAvailableExams();
  const { data: questionsData, isLoading: questionsLoading } = useQuestions({ per_page: 1 });

  // Calculate statistics
  const stats = useMemo(() => {
    const exams = examsData?.data || [];
    // Convert object to array if needed (in case backend returns object with numeric keys)
    const availableExamsDataValue = availableExamsData?.data;
    const availableExams = Array.isArray(availableExamsDataValue) 
      ? availableExamsDataValue 
      : availableExamsDataValue && typeof availableExamsDataValue === 'object' 
      ? Object.values(availableExamsDataValue) 
      : [];
    const totalQuestions = questionsData?.meta?.total || 0;

    const isCreator = user?.roles?.includes('admin') || 
                     user?.roles?.includes('content_manager') || 
                     user?.roles?.includes('creator');

    return {
      totalExamsCreated: isCreator ? exams.length : 0,
      totalExamsParticipated: availableExams.length,
      totalQuestions: totalQuestions,
      completedExams: availableExams.filter((e: any) => e.status === 'completed').length,
      isLoading: examsLoading || availableExamsLoading || questionsLoading,
    };
  }, [examsData, availableExamsData, questionsData, examsLoading, availableExamsLoading, questionsLoading, user]);

  const isCreator = user?.roles?.includes('admin') || 
                   user?.roles?.includes('content_manager') || 
                   user?.roles?.includes('creator');

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          پنل کاربری
        </Typography>
        <Typography variant="body1" color="text.secondary">
          خوش آمدید، {user?.name}
        </Typography>
      </Box>
    </Stack>
  );
}

