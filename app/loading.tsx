import { Box, CircularProgress, Skeleton, Stack } from "@mui/material";

export default function Loading() {
  return (
    <Stack spacing={2} sx={{ p: 1 }}>
      <Skeleton variant="text" width="40%" height={40} />
      <Skeleton variant="rounded" height={120} />
      <Skeleton variant="rounded" height={200} />
      <Box display="flex" justifyContent="center" py={2}>
        <CircularProgress size={32} />
      </Box>
    </Stack>
  );
}
