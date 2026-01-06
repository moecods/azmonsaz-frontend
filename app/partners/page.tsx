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
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { dataService } from '@/lib/data-service';
import { queryKeys } from '@/lib/query-client';
import { Partner } from '@/types';
import BusinessIcon from '@mui/icons-material/Business';
import LaunchIcon from '@mui/icons-material/Launch';
import { useRouter } from 'next/navigation';

export default function PartnersPage() {
  const router = useRouter();
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  // Fetch partners
  const { data: partnersData, isLoading: partnersLoading, error } = useQuery({
    queryKey: queryKeys.partners,
    queryFn: () => dataService.getPartners(),
  });

  const handleCreateExam = (partner: Partner) => {
    // Generate deep link for exam creation
    const deepLink = `/exams/create?partner_id=${partner.id}&callback_url=${encodeURIComponent(partner.callback_url)}`;
    router.push(deepLink);
  };

  const partners = Array.isArray(partnersData?.data) ? partnersData.data : [];

  if (partnersLoading) {
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
          Failed to load partners. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Partner Websites
          </Typography>
          <Typography color="text.secondary">
            Select a partner to create an exam for their website.
          </Typography>
        </Box>

        {partners.length === 0 ? (
          <Alert severity="info">
            No partners available. Contact an administrator to add partner websites.
          </Alert>
        ) : (
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: 3 
            }}
          >
            {partners.map((partner) => (
              <Card 
                key={partner.id}
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
                      <BusinessIcon color="primary" />
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {partner.name}
                      </Typography>
                      <Chip 
                        label={partner.is_active ? 'Active' : 'Inactive'} 
                        color={partner.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </Stack>

                    {partner.website_url && (
                      <Typography variant="body2" color="text.secondary">
                        Website: {partner.website_url}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      Callback: {partner.callback_url}
                    </Typography>

                    <Box sx={{ mt: 'auto' }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleCreateExam(partner)}
                        disabled={!partner.is_active}
                        startIcon={<LaunchIcon />}
                      >
                        Create Exam
                      </Button>
                    </Box>
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
                How it works
              </Typography>
              <Typography variant="body2" color="text.secondary">
                1. Select a partner website from the list above
              </Typography>
              <Typography variant="body2" color="text.secondary">
                2. Create your exam with questions from the question bank or custom questions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3. Complete the exam to generate a PDF and redirect back to the partner website
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
