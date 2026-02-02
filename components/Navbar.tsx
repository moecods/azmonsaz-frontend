"use client";

import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks";
import LoginIcon from "@mui/icons-material/Login";
import SchoolIcon from "@mui/icons-material/School";
import UserMenu from "./layout/UserMenu";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

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
        bgcolor: 'background.paper',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
          }}
          onClick={() => router.push('/')}
        >
          <SchoolIcon sx={{ color: 'primary.main' }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              color: 'text.primary',
            }}
          >
            آزمون‌ساز
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box display="flex" alignItems="center" gap={2}>
          {isAuthenticated ? (
            <UserMenu />
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

