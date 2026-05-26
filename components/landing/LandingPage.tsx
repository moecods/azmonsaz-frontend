"use client";

import { Box, useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { useHasAuthTokenHydrated } from "@/hooks";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingBenefits } from "@/components/landing/LandingBenefits";
import { LandingCta } from "@/components/landing/LandingCta";
import { LandingFooter } from "@/components/landing/LandingFooter";

export function LandingPage() {
  const router = useRouter();
  const theme = useTheme();
  const showLoggedIn = useHasAuthTokenHydrated();
  const scrollRef = useRef<HTMLDivElement>(null);

  const goAuth = useCallback(() => router.push("/login"), [router]);
  const goDashboard = useCallback(() => router.push("/dashboard"), [router]);
  const goPrimary = useCallback(
    () => (showLoggedIn ? goDashboard() : goAuth()),
    [showLoggedIn, goAuth, goDashboard]
  );

  const scrollToSection = useCallback((sectionId: string) => {
    const root = scrollRef.current;
    const target = root?.querySelector(`#${sectionId}`) ?? document.getElementById(sectionId);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      <LandingHeader
        showLoggedIn={showLoggedIn}
        onNavigate={scrollToSection}
        onAuth={goAuth}
        onDashboard={goDashboard}
      />

      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "thin",
          scrollbarColor: `${theme.palette.divider} transparent`,
        }}
      >
        <LandingHero showLoggedIn={showLoggedIn} onPrimaryAction={goPrimary} />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingBenefits />
        <LandingCta showLoggedIn={showLoggedIn} onPrimaryAction={goPrimary} />
        <LandingFooter />
      </Box>
    </Box>
  );
}
