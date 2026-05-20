"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect /exams-available to /exams/available (canonical route).
 * Kept for backward compatibility with bookmarks/links.
 */
export default function ExamsAvailableRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/exams/available');
  }, [router]);

  return null;
}
