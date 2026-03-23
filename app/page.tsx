"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
  Chip,
  Avatar,
  alpha,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useRouter } from "next/navigation";
import SchoolIcon from "@mui/icons-material/School";
import QuizIcon from "@mui/icons-material/Quiz";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import GroupIcon from "@mui/icons-material/Group";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useAuth } from "@/hooks";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useEffect, useMemo, useRef, useState} from "react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowDown") {
                scrollToSection(Math.min(4, activeSection + 1));
            } else if (event.key === "ArrowUp") {
                scrollToSection(Math.max(0, activeSection - 1));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [activeSection]); // وابستگی به activeSection برای آپدیت شدن موقعیت

  const scrollToSection = (index: number) => {
    if (containerRef.current) {
      const sections = containerRef.current.children;
      if (sections[index]) {
        sections[index].scrollIntoView({ behavior: "smooth" });
      }
    }
  };


  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollTop;
      // محاسبه دقیق‌تر ایندکس فعال با توجه به ارتفاع هر سکشن
      let currentIndex = 0;
      const children = Array.from(container.children) as HTMLElement[];

      for (let i = 0; i < children.length; i++) {
        if (children[i].offsetTop <= scrollPosition + container.clientHeight / 2) {
          currentIndex = i;
        }
      }
      setActiveSection(currentIndex);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const featuresData = [
    { icon: <SchoolIcon />, title: "بانک سوالات هوشمند", desc: "ایجاد و مدیریت آرشیو نامحدود از سوالات با قابلیت دسته‌بندی چندلایه و برچسب‌گذاری پیشرفته." },
    { icon: <QuizIcon />, title: "سازنده آزمون انعطاف‌پذیر", desc: "طراحی آزمون با تنظیمات دقیق (زمان، نمره‌دهی، تصادفی‌سازی) کاملاً متناسب با نیازهای آموزشی شما." },
    { icon: <SecurityIcon />, title: "امنیت و تضمین کیفیت", desc: "استفاده از پروتکل‌های امنیتی پیشرفته برای حفظ محرمانگی سوالات و نتایج آزمون‌دهندگان." },
    { icon: <SpeedIcon />, title: "عملکرد و سرعت بالا", desc: "زیرساخت فنی قدرتمند که تضمین می‌کند آزمون‌ها حتی با هزاران کاربر همزمان بدون اختلال اجرا شوند." },
    { icon: <AnalyticsIcon />, title: "داشبورد تحلیلی", desc: "گزارش‌های دقیق و نمودارهای آماری از عملکرد آزمون‌دهندگان برای تصمیم‌گیری‌های آموزشی بهتر." },
    { icon: <GroupIcon />, title: "مدیریت کاربران", desc: "تعریف سطوح دسترسی مختلف (مدیر، ناظر، آزمون‌دهنده) برای مدیریت ساده سازمان‌های بزرگ." },
  ];

  const stepsData = [
    { step: "۱", title: "ایجاد حساب", desc: "ثبت‌نام سریع و راه‌اندازی پنل مدیریت اختصاصی سازمان خود" },
    { step: "۲", title: "طراحی سوالات", desc: "تایپ یا وارد کردن سوالات در بانک سوالات با دسته‌بندی‌های دلخواه" },
    { step: "۳", title: "تنظیم آزمون", desc: "انتخاب سوالات، تعیین زمان و نمره‌دهی و انتشار آزمون" },
    { step: "۴", title: "تحلیل نتایج", desc: "مشاهده لحظه‌ای پاسخ‌ها و دریافت گزارش‌های تحلیلی دقیق" },
  ];

  const benefitsData = [
    "صرفه‌جویی چشمگیر در زمان با قابلیت استفاده مجدد از سوالات",
    "سازمان‌دهی منعطف با دسته‌بندی‌های درختی و برچسب‌گذاری",
    "تضمین امنیت داده‌ها با رمزنگاری پیشرفته و سرورهای امن",
    "شخصی‌سازی کامل ظاهر آزمون‌ها با لوگوی سازمان شما",
    "مدیریت متمرکز تمامی آزمون‌ها و کاربران در یک داشبورد",
    "پشتیبانی فنی سریع و مستمر برای سازمان‌ها",
  ];

  return (
    <Box sx={{ height: "100vh", width: "100vw", overflow: "hidden", bgcolor: "background.default" }}>
      <Box
        ref={containerRef}
        sx={{
          height: "100%",
          width: "100%",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          scrollBehavior: "smooth",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {/* --- Section 1: Hero --- */}
          <Box
              sx={{
                  minHeight: "100vh",
                  width: "100%",
                  scrollSnapAlign: "start",
                  background: "linear-gradient(135deg, #1a237e 0%, #311b92 100%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
              }}
          >
              {/* --- دکمه لاگین (بالا سمت راست) --- */}
              <Box
                  sx={{
                      position: "absolute",
                      top: 20,
                      right: { xs: 20, md: 40 },
                      zIndex: 10,
                  }}
              >
                  {!isAuthenticated ? (
                      <Button
                          variant="outlined"
                          onClick={() => router.push("/login")}
                          sx={{
                              color: "white",
                              borderColor: "rgba(255,255,255,0.5)",
                              px: 3,
                              py: 1,
                              borderRadius: 2,
                              fontWeight: "bold",
                              backdropFilter: "blur(5px)",
                              bgcolor: "rgba(255,255,255,0.05)",
                              "&:hover": {
                                  bgcolor: "rgba(255,255,255,0.15)",
                                  borderColor: "white",
                              },
                              transition: "all 0.3s",
                          }}
                      >
                          ورود به حساب
                      </Button>
                  ) : (
                      <Button
                          variant="contained"
                          onClick={() => router.push("/dashboard")}
                          sx={{
                              bgcolor: "white",
                              color: "primary.main",
                              px: 3,
                              py: 1,
                              borderRadius: 2,
                              fontWeight: "bold",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                              "&:hover": {
                                  bgcolor: "#f5f5f5",
                                  transform: "translateY(-2px)",
                              },
                              transition: "all 0.3s",
                          }}
                      >
                          پنل کاربری
                      </Button>
                  )}
              </Box>

              {/* پس‌زمینه پترن */}
              <Box
                  sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'0.05\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
                      opacity: 0.3,
                  }}
              />
              <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: { xs: 4, md: 0 } }}>
                  <Stack spacing={4} alignItems="center" textAlign="center">
                      <Chip
                          label="نسل جدید پلتفرم‌های ارزشیابی"
                          sx={{
                              bgcolor: alpha("#ffffff", 0.15),
                              color: "white",
                              fontWeight: "bold",
                              backdropFilter: "blur(4px)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              px: 1,
                              mb: 2,
                          }}
                      />
                      <Typography
                          variant="h1"
                          fontWeight="900"
                          sx={{
                              fontSize: { xs: "2.5rem", md: "5rem" },
                              lineHeight: 1.1,
                              mb: 3,
                              background: "linear-gradient(to right, #fff, #b39ddb)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                          }}
                      >
                          {process.env.NEXT_PUBLIC_APP_NAME_FA || "آزمون‌ساز"}
                      </Typography>
                      <Typography
                          variant="h5"
                          sx={{
                              maxWidth: 800,
                              opacity: 0.9,
                              fontSize: { xs: "1rem", md: "1.6rem" },
                              lineHeight: 1.8,
                              fontWeight: 300,
                          }}
                      >
                          پلتفرمی جامع، امن و پیشرفته برای طراحی، اجرا و تحلیل آزمون‌های آنلاین.
                          <br />
                          ابزاری ایده‌آل برای دانشگاه‌ها، مدارس و سازمان‌های بزرگ.
                      </Typography>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ mt: 4, width: "100%", justifyContent: "center" }}>
                          <Button
                              variant="contained"
                              size="large"
                              onClick={() => router.push(isAuthenticated ? "/dashboard" : "/login")}
                              sx={{
                                  bgcolor: "white",
                                  color: "primary.main",
                                  px: 5,
                                  py: 2,
                                  fontSize: "1.1rem",
                                  fontWeight: "bold",
                                  borderRadius: 3,
                                  boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                                  "&:hover": {
                                      bgcolor: "#f5f5f5",
                                      transform: "translateY(-4px)",
                                      boxShadow: "0 15px 30px rgba(0,0,0,0.3)",
                                  },
                                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              }}
                              endIcon={<RocketLaunchIcon />}
                          >
                              شروع رایگان
                          </Button>
                      </Stack>
                  </Stack>
              </Container>
          </Box>

        {/* --- Section 2: Features --- */}
        <Box
          sx={{
            minHeight: "100vh", // تغییر از height به minHeight
            width: "100%",
            scrollSnapAlign: "start",
            display: "flex",
            alignItems: "center", // عمودی وسط چین
            justifyContent: "center",
            py: { xs: 4, md: 0 }, // پدینگ عمودی برای موبایل
          }}
        >
          <Container maxWidth="lg" sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Box textAlign="center" mb={4}>
              <Typography variant="overline" color="primary" fontWeight="bold" letterSpacing={2} sx={{ display: "block", mb: 2 }}>
                امکانات بی‌نظیر
              </Typography>
              <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: "1.8rem", md: "3rem" } }}>
                ابزارهای حرفه‌ای برای مدیریت آزمون
              </Typography>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
              {featuresData.map((item, index) => (
                <Card
                  key={index}
                  sx={{
                    height: "100%",
                    textAlign: "center",
                    p: { xs: 2, md: 3 }, // کاهش پدینگ در موبایل
                    border: "1px solid",
                    borderColor: "grey.100",
                    borderRadius: 3,
                    transition: "all 0.4s ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    "&:hover": { transform: "translateY(-5px)", boxShadow: "0 10px 20px rgba(0,0,0,0.08)", borderColor: "primary.main" },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Avatar sx={{ width: 50, height: 50, bgcolor: "primary.light", mx: "auto", mb: 2, color: "primary.main" }}>
                      {item.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: "1.1rem", md: "1.25rem" } }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: { xs: "0.85rem", md: "1rem" } }}>
                      {item.desc}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Container>
        </Box>

        {/* --- Section 3: How It Works --- */}
        <Box
          sx={{
            minHeight: "100vh", // تغییر از height به minHeight
            width: "100%",
            scrollSnapAlign: "start",
            bgcolor: "grey.50",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: { xs: 4, md: 0 },
          }}
        >
          <Container maxWidth="lg" sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Box textAlign="center" mb={6}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold" letterSpacing={2} sx={{ display: "block", mb: 2 }}>
                مسیر ساده موفقیت
              </Typography>
              <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: "1.8rem", md: "3rem" } }}>
                چگونه آزمون خود را راه‌اندازی کنید؟
              </Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: { xs: 2, md: 4 } }}>
              {stepsData.map((item, index) => (
                <Box key={index}>
                  <Card sx={{ height: "100%", textAlign: "center", p: { xs: 2, md: 3 }, boxShadow: 3, borderRadius: 3, bgcolor: "white" }}>
                    <CardContent sx={{ p: 0 }}>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main", color: "white", mx: "auto", mb: 2, fontSize: "1rem", fontWeight: "bold" }}>
                        {item.step}
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: { xs: "0.8rem", md: "1rem" } }}>
                        {item.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        {/* --- Section 4: Benefits --- */}
        <Box
          sx={{
            minHeight: "100vh", // تغییر از height به minHeight
            width: "100%",
            scrollSnapAlign: "start",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: { xs: 4, md: 0 },
          }}
        >
          <Container maxWidth="lg" sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Box textAlign="center" mb={6}>
              <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: "1.8rem", md: "3rem" } }}>
                چرا آزمون‌ساز را انتخاب کنید؟
              </Typography>
              <Typography variant="h6" color="text.secondary">
                مزایای رقابتی که ما را متمایز می‌کند
              </Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: { xs: 2, md: 4 }, maxWidth: 900, mx: "auto" }}>
              {benefitsData.map((benefit, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "flex-start", gap: 2, p: 2, borderRadius: 2, transition: "background 0.3s", "&:hover": { bgcolor: "grey.50" } }}>
                  <CheckCircleIcon sx={{ color: "success.main", fontSize: 24, mt: 0.5, minWidth: 24 }} />
                  <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: { xs: "0.9rem", md: "1rem" } }}>
                    {benefit}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        {/* --- Section 5: CTA --- */}
        <Box
          sx={{
            minHeight: "100vh", // تغییر از height به minHeight
            width: "100%",
            scrollSnapAlign: "start",
            background: "linear-gradient(135deg, #311b92 0%, #1a237e 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            position: "relative",
          }}
        >
          <Container maxWidth="md" sx={{ position: "relative", zIndex: 2, py: { xs: 4, md: 0 } }}>
            <Stack spacing={4} alignItems="center">
              <Typography variant="h3" fontWeight="bold" sx={{ fontSize: { xs: "2rem", md: "3.5rem" } }}>
                آماده تحول در ارزشیابی هستید؟
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600, lineHeight: 1.8, fontSize: { xs: "1rem", md: "1.25rem" } }}>
                همین حالا به جمع هزاران مدیر آموزشی بپیوندید و تجربه‌ای متفاوت از برگزاری آزمون‌های آنلاین داشته باشید.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push(isAuthenticated ? "/dashboard" : "/login")}
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  px: 6,
                  py: 2,
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  borderRadius: 50,
                  boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                  "&:hover": { bgcolor: "#f0f0f0", transform: "scale(1.05)" },
                  transition: "all 0.3s ease",
                }}
                endIcon={<ArrowBackIcon />}
              >
                شروع کنید
              </Button>
            </Stack>
          </Container>
        </Box>
      </Box>

      {/* --- Navigation Dots --- */}
      <Box
        sx={{
          position: "fixed",
          right: { xs: 10, md: 30 },
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {[0, 1, 2, 3, 4].map((index) => (
          <Tooltip key={index} title={["خانه", "ویژگی‌ها", "مراحل", "مزایا", "شروع"][index]} placement="left">
            <Box
              onClick={() => scrollToSection(index)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: activeSection === index ? "primary.main" : "grey.400",
                cursor: "pointer",
                transition: "all 0.3s",
                boxShadow: activeSection === index ? "0 0 0 4px rgba(25, 118, 210, 0.2)" : "none",
                "&:hover": { transform: "scale(1.2)" },
              }}
            />
          </Tooltip>
        ))}
      </Box>

      {/* --- Navigation Arrows --- */}
      <Box
        sx={{
          position: "fixed",
          left: { xs: 10, md: 30 },
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Tooltip title="بالا" placement="right">
          <IconButton
            onClick={() => scrollToSection(Math.max(0, activeSection - 1))}
            sx={{
              bgcolor: "rgba(255,255,255,0.8)",
              color: "text.primary",
              boxShadow: 3,
              "&:hover": { bgcolor: "white", transform: "translateX(-5px)" },
              transition: "all 0.3s",
            }}
          >
            <KeyboardArrowUpIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="پایین" placement="right">
          <IconButton
            onClick={() => scrollToSection(Math.min(4, activeSection + 1))}
            sx={{
              bgcolor: "rgba(255,255,255,0.8)",
              color: "text.primary",
              boxShadow: 3,
              "&:hover": { bgcolor: "white", transform: "translateX(-5px)" },
              transition: "all 0.3s",
            }}
          >
            <KeyboardArrowDownIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}