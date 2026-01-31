"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'content_manager' | 'creator';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Only redirect if we're sure user is not authenticated (not just loading)
    // Add a delay to prevent race conditions with login redirect
    if (!isLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        // Double check authentication state before redirecting
        // Use replace to avoid adding to history stack
        if (!isAuthenticated) {
          router.replace('/login');
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, router, mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    if (!isLoading && isAuthenticated && requiredRole && !user?.roles?.includes(requiredRole)) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, mounted]);

  // Show loading during initial mount to prevent hydration mismatch
  if (!mounted || isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && !user?.roles?.includes(requiredRole)) {
    return null;
  }

  return <>{children}</>;
}

