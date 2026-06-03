import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "@/theme/loadVazirmatnFont";
import { CssBaseline } from "@mui/material";
import ThemeRegistry from "../theme/ThemeRegistry";
import { QueryProvider } from "./providers/QueryProvider";
import LayoutContent from "./LayoutContent";
import PwaServiceWorkerRegister from "@/components/pwa/PwaServiceWorkerRegister";
import { getPwaAppName } from "@/lib/pwa-config";

export const metadata: Metadata = {
  title: (process.env.APP_NAME_EN || "APP_NAME") + " - Exam Builder",
  description: "Create and manage exams with our powerful exam builder platform",
  applicationName: getPwaAppName(),
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: getPwaAppName(),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <Script
          id="crypto-randomuuid-polyfill"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(typeof globalThis.crypto==="undefined")globalThis.crypto={};var c=globalThis.crypto;if(typeof c.randomUUID==="function"){c.randomUUID();return}}catch(e){}function g(){var b=new Uint8Array(16);if(typeof globalThis.crypto.getRandomValues==="function")globalThis.crypto.getRandomValues(b);else for(var i=0;i<16;i++)b[i]=Math.floor(Math.random()*256);b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;var h=Array.from(b,function(x){return x.toString(16).padStart(2,"0")}).join("");return h.slice(0,8)+"-"+h.slice(8,12)+"-"+h.slice(12,16)+"-"+h.slice(16,20)+"-"+h.slice(20)}Object.defineProperty(globalThis.crypto,"randomUUID",{value:g,writable:true,configurable:true})})();`,
          }}
        />
        <QueryProvider>
          <ThemeRegistry>
            <CssBaseline />
            <PwaServiceWorkerRegister />
            <LayoutContent>{children}</LayoutContent>
          </ThemeRegistry>
        </QueryProvider>
      </body>
    </html>
  );
}
