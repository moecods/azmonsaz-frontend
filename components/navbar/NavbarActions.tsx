import { Box, Button } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import Link from "next/link";
import { useAuth } from "@/hooks";
import UserMenu from "../layout/UserMenu";
import NotificationBell from "../notifications/NotificationBell";

const NavbarActions = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Box display="flex" alignItems="center" gap={2}>
      {isAuthenticated ? (
        <>
          <NotificationBell />
          <UserMenu />
        </>
      ) : (
        <Button
          variant="contained"
          startIcon={<LoginIcon />}
          component={Link}
          href="/login"
        >
          ورود
        </Button>
      )}
    </Box>
  );
};

export default NavbarActions;