import { Typography, Box } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";

import Link from "next/link";

const NavbarLogo = () => {
  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
        }}
      >
        <SchoolIcon sx={{ color: 'primary.main' }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: 'text.primary',
          }}
        >
          {process.env.NEXT_PUBLIC_APP_NAME_FA || "آزمون‌ساز"}
        </Typography>
      </Box>
    </Link>
  );
};

export default NavbarLogo;