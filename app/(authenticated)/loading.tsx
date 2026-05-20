import { Box, CircularProgress, Skeleton, Stack } from "@mui/material";

export default function AuthenticatedLoading() {
  return (
    <Stack spacing={2} sx={{ p: 1 }}>
      <Skeleton variant="text" width="35%" height={36} />
      <Skeleton variant="text" width="55%" height={24} />
      <Skeleton variant="rounded" height={160} />
      <Box display="flex" justifyContent="center" py={3}>
        <CircularProgress size={28} />
      </Box>
    </Stack>
  );
}
