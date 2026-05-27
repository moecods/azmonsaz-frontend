"use client";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import UserAvatar from "@/components/ui/UserAvatar";
import type { SearchUserResult } from "@/components/exams/ParticipantManagement.types";

interface ParticipantSearchTabProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchResults: SearchUserResult[] | undefined;
  isSearching: boolean;
  selectedUserIds: number[];
  existingParticipantIds: Set<number | undefined>;
  onToggleUser: (userId: number) => void;
  onAddSelected: () => void;
  isAdding: boolean;
}

export function ParticipantSearchTab({
  searchQuery,
  onSearchChange,
  searchResults,
  isSearching,
  selectedUserIds,
  existingParticipantIds,
  onToggleUser,
  onAddSelected,
  isAdding,
}: ParticipantSearchTabProps) {
  const theme = useTheme();
  const showEmpty =
    searchQuery.length >= 3 && !isSearching && searchResults && searchResults.length === 0;

  return (
    <Stack spacing={2}>
      <TextField
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="نام، موبایل یا کد ملی (حداقل ۳ کاراکتر)"
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      {isSearching && (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress size={28} />
        </Box>
      )}

      {showEmpty && <Alert severity="info">نتیجه‌ای یافت نشد.</Alert>}

      {searchResults && searchResults.length > 0 && (
        <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          {searchResults.map((user) => {
            const isSelected = selectedUserIds.includes(user.id);
            const alreadyAdded = existingParticipantIds.has(user.id);
            return (
              <ListItem
                key={user.id}
                disablePadding
                sx={{
                  border: 1,
                  borderColor: isSelected ? "primary.main" : "divider",
                  borderRadius: 2,
                  bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.06) : undefined,
                }}
              >
                <ListItemButton
                  onClick={() => !alreadyAdded && onToggleUser(user.id)}
                  disabled={alreadyAdded}
                  sx={{ py: 1 }}
                >
                  <Checkbox
                    edge="start"
                    checked={isSelected}
                    tabIndex={-1}
                    disableRipple
                    disabled={alreadyAdded}
                    onChange={() => onToggleUser(user.id)}
                  />
                  <UserAvatar name={user.name} sx={{ width: 36, height: 36, mr: 1 }} />
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={600}>
                          {user.name}
                        </Typography>
                        {alreadyAdded && (
                          <Chip label="اضافه شده" size="small" color="success" variant="outlined" />
                        )}
                      </Stack>
                    }
                    secondary={[user.phone_number, user.national_id].filter(Boolean).join(" · ")}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )}

      {selectedUserIds.length > 0 && (
        <Button
          variant="contained"
          fullWidth
          onClick={onAddSelected}
          disabled={isAdding}
          startIcon={isAdding ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
        >
          {isAdding
            ? "در حال افزودن..."
            : `افزودن ${selectedUserIds.length.toLocaleString("fa-IR")} نفر`}
        </Button>
      )}
    </Stack>
  );
}
