import type { Metadata } from "next";
import "./globals.css";
import { Box, CssBaseline } from "@mui/material";
import ThemeRegistry from "../theme/ThemeRegistry";
import { QueryProvider } from "./providers/QueryProvider";
import { DataSourceIndicator } from '@/components/DataSourceIndicator';
import Navbar from '@/components/Navbar';
import LayoutContent from './LayoutContent';

export const metadata: Metadata = {
  title: "Azmoon-Saz - Exam Builder",
  description: "Create and manage exams with our powerful exam builder platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="antialiased">
        <QueryProvider>
          <ThemeRegistry>
            <CssBaseline />
            <LayoutContent>{children}</LayoutContent>
            <DataSourceIndicator />
          </ThemeRegistry>
        </QueryProvider>
      </body>
    </html>
  );
}
