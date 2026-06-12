"use client";

import { Box, ToggleButton, ToggleButtonGroup, Typography, alpha } from "@mui/material";
import { DIFFICULTY_CONFIG } from "@/constants/question";

interface DifficultySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const DIFFICULTY_ORDER = ["easy", "medium", "hard"] as const;

export function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        سطح دشواری
      </Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, next) => {
          if (next) onChange(next);
        }}
        sx={{
          display: "flex",
          width: "100%",
          "& .MuiToggleButtonGroup-grouped": {
            border: "1px solid",
            borderRadius: "8px !important",
            mx: 0,
            flex: 1,
          },
        }}
      >
        {DIFFICULTY_ORDER.map((id) => {
          const { label, color } = DIFFICULTY_CONFIG[id];
          const selected = value === id;
          return (
            <ToggleButton
              key={id}
              value={id}
              sx={(theme) => ({
                py: 1,
                textTransform: "none",
                fontWeight: selected ? 700 : 500,
                ...(selected
                  ? {
                      bgcolor: alpha(theme.palette[color].main, 0.12),
                      color: `${color}.dark`,
                      borderColor: `${color}.main !important`,
                      "&:hover": {
                        bgcolor: alpha(theme.palette[color].main, 0.18),
                      },
                    }
                  : {
                      color: "text.secondary",
                    }),
              })}
            >
              {label}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </Box>
  );
}
