'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  PictureAsPdf as PDFIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { Question } from './QuestionBankBuilder';

interface CustomPDFExportProps {
  questions: Question[];
  title: string;
  filename?: string;
  onExportComplete?: (pdfUrl: string) => void;
}

export default function CustomPDFExport({
  questions,
  title,
  filename: _filename = 'exam.pdf',
  onExportComplete,
}: CustomPDFExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      // Create a simple HTML content for the exam
      const htmlContent = generateExamHTML(questions, title);
      
      // Create a new window with the HTML content
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Unable to open print window. Please check your popup blocker.');
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load
      printWindow.onload = () => {
        // Trigger print dialog
        printWindow.print();
        
        // Close the window after printing
        setTimeout(() => {
          printWindow.close();
        }, 1000);

        if (onExportComplete) {
          onExportComplete('PDF exported successfully');
        }
        
        setIsExporting(false);
        setIsDialogOpen(false);
      };

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export PDF');
      setIsExporting(false);
    }
  };

  const generateExamHTML = (questions: Question[], examTitle: string): string => {
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${examTitle}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .question {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .question-title {
              font-weight: bold;
              margin-bottom: 10px;
            }
            .question-meta {
              color: #666;
              font-size: 0.9em;
              margin-bottom: 15px;
            }
            .options {
              margin-left: 20px;
            }
            .option {
              margin-bottom: 5px;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 0.9em;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${examTitle}</h1>
            <p>Total Questions: ${questions.length} | Total Points: ${totalPoints}</p>
          </div>

          ${questions.map((question, index) => `
            <div class="question">
              <div class="question-title">
                ${index + 1}. ${question.title}
              </div>
              <div class="question-meta">
                Type: ${question.type} | Difficulty: ${question.difficulty} | Points: ${question.points}
              </div>
              
              ${question.options && question.options.length > 0 ? `
                <div class="options">
                  ${question.options.map((option, optIndex) => `
                    <div class="option">
                      ${String.fromCharCode(65 + optIndex)}. ${option}
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              ${question.type === 'text' ? `
                <div style="margin-top: 15px;">
                  <p>Answer: _________________________________</p>
                </div>
              ` : ''}
              
              ${question.type === 'number' ? `
                <div style="margin-top: 15px;">
                  <p>Answer: _________________________________</p>
                </div>
              ` : ''}
            </div>
          `).join('')}

          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <Box>
      <Button
        variant="contained"
        startIcon={isExporting ? <CircularProgress size={20} /> : <PDFIcon />}
        onClick={() => setIsDialogOpen(true)}
        disabled={isExporting}
        color="error"
      >
        {isExporting ? 'Exporting...' : 'Export PDF'}
      </Button>

      <Dialog
        open={isDialogOpen}
        onClose={() => !isExporting && setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Export Exam to PDF
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This will open a print dialog where you can save the exam as a PDF.
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Instructions:</strong>
          </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
            1. Click &quot;Export&quot; to open the print dialog<br/>
            2. In the print dialog, select &quot;Save as PDF&quot; as the destination<br/>
            3. Choose your save location and filename<br/>
            4. Click &quot;Save&quot; to download the PDF
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDialogOpen(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            variant="contained"
            startIcon={isExporting ? <CircularProgress size={20} /> : <DownloadIcon />}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
