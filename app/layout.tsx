import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Box, CssBaseline } from "@mui/material";
import ThemeRegistry from "../theme/ThemeRegistry";
import { QueryProvider } from "./providers/QueryProvider";
import { DataSourceIndicator } from '@/components/DataSourceIndicator';
import Navbar from '@/components/Navbar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <ThemeRegistry>
            <CssBaseline />
            <Navbar />
            <Box component="main">{children}</Box>
            <DataSourceIndicator />
          </ThemeRegistry>
        </QueryProvider>
      </body>
    </html>
  );
}
