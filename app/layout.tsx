import type { Metadata } from "next";
import "./globals.css";
import { CssBaseline } from "@mui/material";
import ThemeRegistry from "../theme/ThemeRegistry";
import { QueryProvider } from "./providers/QueryProvider";
import LayoutContent from "./LayoutContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: (process.env.APP_NAME_EN || "APP_NAME") + " - Exam Builder",
  description: "Create and manage exams with our powerful exam builder platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <QueryProvider>
          <ThemeRegistry>
            <CssBaseline />
            <LayoutContent>{children}</LayoutContent>
          </ThemeRegistry>
        </QueryProvider>
      </body>
    </html>
  );
}
