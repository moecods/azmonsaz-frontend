"use client";

import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";

export interface ParticipantOption {
  id: number;
  name: string;
  phone_number?: string | null;
  email?: string | null;
}

interface ParticipantSelectorProps {
  participants: ParticipantOption[];
  selectedIds: number[] | "all";
  onSelectionChange: (selected: number[] | "all") => void;
  disabled?: boolean;
}

export default function ParticipantSelector({
  participants,
  selectedIds,
  onSelectionChange,
  disabled = false,
}: ParticipantSelectorProps) {
  const theme = useTheme();

  const handleAllChange = (checked: boolean) => {
    onSelectionChange(checked ? "all" : []);
  };

  const handleParticipantChange = (id: number, checked: boolean) => {
    if (selectedIds === "all") {
      if (checked) return;
      onSelectionChange(participants.filter((p) => p.id !== id).map((p) => p.id));
      return;
    }
    if (checked) {
      const next = [...selectedIds, id];
      onSelectionChange(next.length === participants.length ? "all" : next);
    } else {
      onSelectionChange(selectedIds.filter((x) => x !== id));
    }
  };

  const isAllSelected =
    selectedIds === "all" || selectedIds.length === participants.length;
  const isParticipantSelected = (id: number) =>
    selectedIds === "all" || selectedIds.includes(id);

  const selectedCount =
    selectedIds === "all" ? participants.length : selectedIds.length;

  return (
    <Box>
      <FormGroup sx={{ mb: 1 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={isAllSelected}
              indeterminate={
                selectedIds !== "all" &&
                selectedIds.length > 0 &&
                selectedIds.length < participants.length
              }
              onChange={(e) => handleAllChange(e.target.checked)}
              disabled={disabled || participants.length === 0}
            />
          }
          label={
            <Typography variant="body2" fontWeight={600}>
              همه شرکت‌کنندگان
              {participants.length > 0 && (
                <Typography component="span" variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                  {" "}
                  ({selectedCount.toLocaleString("fa-IR")} از{" "}
                  {participants.length.toLocaleString("fa-IR")})
                </Typography>
              )}
            </Typography>
          }
        />
      </FormGroup>

      {participants.length > 0 ? (
        <List
          dense
          sx={{
            maxHeight: 220,
            overflow: "auto",
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
          }}
        >
          {participants.map((p) => (
            <ListItem key={p.id} disablePadding divider>
              <ListItemButton
                onClick={() =>
                  handleParticipantChange(p.id, !isParticipantSelected(p.id))
                }
                disabled={disabled}
                sx={{ py: 0.75 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Checkbox
                    edge="start"
                    checked={isParticipantSelected(p.id)}
                    tabIndex={-1}
                    disableRipple
                    disabled={disabled}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={p.name}
                  secondary={p.phone_number || p.email || undefined}
                  primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
                  secondaryTypographyProps={{ variant: "caption" }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Box
          sx={{
            py: 3,
            textAlign: "center",
            border: 1,
            borderStyle: "dashed",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <PeopleIcon sx={{ color: "text.disabled", mb: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            شرکت‌کننده‌ای برای انتخاب وجود ندارد
          </Typography>
        </Box>
      )}
    </Box>
  );
}
