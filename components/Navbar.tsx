"use client";

import { AppBar, Toolbar, Typography, Button, Box, IconButton } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import SchoolIcon from "@mui/icons-material/School";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Don't show navbar on login page
  if (pathname === '/login') {
    return null;
  }

  return (
    <AppBar 
      position="static" 
      color="transparent" 
      elevation={0}
      sx={{ 
        borderBottom: 1, 
        borderColor: "divider",
        bgcolor: 'background.paper'
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          sx={{ 
            flexGrow: 1,
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onClick={() => router.push('/')}
        >
          آزمون‌ساز
        </Typography>
        
        <Box display="flex" alignItems="center" gap={2}>
          {isAuthenticated ? (
            <>
              <Button
                variant="text"
                onClick={() => router.push('/dashboard')}
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                داشبورد
              </Button>
              <Button
                variant="text"
                startIcon={<SchoolIcon />}
                onClick={() => router.push('/exams')}
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                آزمون‌ها
              </Button>
              <Button
                variant="text"
                onClick={() => router.push('/exams/available')}
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                آزمون‌های من
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user?.name}
              </Typography>
              {user?.roles?.includes('admin') && (
                <Button
                  variant="text"
                  onClick={() => router.push('/admin')}
                  sx={{ display: { xs: 'none', sm: 'block' } }}
                >
                  پنل مدیریت
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                color="error"
                size="small"
              >
                خروج
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={() => router.push('/login')}
            >
              ورود
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

