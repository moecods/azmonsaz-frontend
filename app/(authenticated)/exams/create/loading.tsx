import { Box, Skeleton, Stack } from "@mui/material";

export default function CreateExamLoading() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="text" width="40%" height={40} />
      <Skeleton variant="text" width="70%" height={24} />
      <Skeleton variant="rounded" height={120} />
      <Skeleton variant="rounded" height={200} />
      <Skeleton variant="rounded" height={200} />
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Skeleton variant="rounded" width={100} height={40} />
        <Skeleton variant="rounded" width={120} height={40} />
      </Box>
    </Stack>
  );
}
