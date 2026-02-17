"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface CreateCustomQuestionProps {
  examId?: number;
}

export default function CreateCustomQuestion({ examId }: CreateCustomQuestionProps) {
  const router = useRouter();
  
  const handleClick = () => {
    const params = new URLSearchParams();
    if (examId) {
      params.set('exam_id', examId.toString());
      params.set('return_url', `/exams/${examId}?tab=questions`);
    }
    router.push(`/questions/create?${params.toString()}`);
  };

  return (
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
      onClick={handleClick}
        fullWidth
      >
        ایجاد سوال سفارشی
      </Button>
  );
}
