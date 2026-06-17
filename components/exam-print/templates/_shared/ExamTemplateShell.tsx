"use client";

import { Box, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";

interface ExamTemplateShellProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
  printStyles?: string;
  dir?: "rtl" | "ltr";
  className?: string;
}

export default function ExamTemplateShell({
  children,
  sx,
  printStyles = "",
  dir = "rtl",
  className,
}: ExamTemplateShellProps) {
  return (
    <Box
      className={className}
      dir={dir}
      sx={{
        fontFamily: '"Vazirmatn", "Tahoma", "Arial", sans-serif',
        lineHeight: 1.8,
        color: "#000",
        background: "#fff",
        padding: "12mm",
        maxWidth: "210mm",
        margin: "0 auto",
        boxSizing: "border-box",
        ...sx,
      }}
    >
      <style>{`
        @media print {
          .exam-print-question {
            page-break-inside: avoid;
          }
          .exam-print-questions-table tr {
            page-break-inside: avoid;
          }
          ${printStyles}
        }
      `}</style>
      {children}
    </Box>
  );
}
