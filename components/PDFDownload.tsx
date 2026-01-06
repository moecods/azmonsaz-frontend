"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  Alert,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface PDFDownloadProps {
  examId: number;
  examTitle: string;
  onDownload?: (url: string) => void;
}

export default function PDFDownload({ examId, examTitle, onDownload }: PDFDownloadProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // In a real implementation, this would call the API to generate the PDF
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate PDF URL generation
      const mockPdfUrl = `https://example.com/exams/${examId}/download.pdf`;
      setPdfUrl(mockPdfUrl);
      
      if (onDownload) {
        onDownload(mockPdfUrl);
      }
    } catch {
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      // Create a temporary link to download the PDF
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${examTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setPdfUrl(null);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setPdfUrl(null);
    setError(null);
  };

  return (
    <>
      <Button
        variant="contained"
        color="success"
        startIcon={<PictureAsPdfIcon />}
        onClick={handleOpen}
      >
        Download PDF
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Download Exam PDF</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Box textAlign="center">
              <PictureAsPdfIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {examTitle}
              </Typography>
              <Typography color="text.secondary">
                Generate a PDF version of this exam for download.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error">{error}</Alert>
            )}

            {isGenerating && (
              <Box textAlign="center" py={3}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography>Generating PDF...</Typography>
              </Box>
            )}

            {pdfUrl && (
              <Alert severity="success">
                PDF generated successfully! Click the download button below to save the file.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {!pdfUrl && !isGenerating && (
            <Button
              variant="contained"
              onClick={handleGeneratePDF}
              startIcon={<PictureAsPdfIcon />}
            >
              Generate PDF
            </Button>
          )}
          {pdfUrl && (
            <Button
              variant="contained"
              color="success"
              onClick={handleDownload}
              startIcon={<DownloadIcon />}
            >
              Download PDF
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
