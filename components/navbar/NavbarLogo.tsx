import { Box } from "@mui/material";
import AuthBrandLogo from "@/components/auth/AuthBrandLogo";

import Link from "next/link";

const NavbarLogo = () => {
  return (
    <Link href="/" style={{ textDecoration: "none" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
        }}
      >
        <AuthBrandLogo variant="withName" />
      </Box>
    </Link>
  );
};

export default NavbarLogo;