"use client";

import { Box, TextField } from "@mui/material";
import { RichLabel } from "@/components/editor";

const BLANK_MARKER = /_{3,}/g;

interface BlankStemRendererProps {
  stemHtml: string;
  blankCount: number;
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  /** Preview mode: show underscores only */
  preview?: boolean;
}

/** Renders stem with inline inputs at blank positions (_____). */
export default function BlankStemRenderer({
  stemHtml,
  blankCount,
  values,
  onChange,
  disabled,
  preview,
}: BlankStemRendererProps) {
  const plain = stemHtml.replace(/<[^>]+>/g, " ");
  const parts = plain.split(BLANK_MARKER);
  const hasMarkers = parts.length > 1;

  if (!hasMarkers) {
    return (
      <StackFallback
        blankCount={blankCount}
        values={values}
        onChange={onChange}
        disabled={disabled}
        preview={preview}
      />
    );
  }

  return (
    <Box sx={{ lineHeight: 2 }}>
      {parts.map((part, idx) => (
        <Box key={idx} component="span" sx={{ display: "inline" }}>
          {part.trim() ? (
            <RichLabel html={part} fontSize="1rem" block={false} sx={{ display: "inline" }} />
          ) : null}
          {idx < parts.length - 1 && (
            preview ? (
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  minWidth: 80,
                  borderBottom: "2px solid",
                  borderColor: "text.primary",
                  mx: 0.5,
                  verticalAlign: "bottom",
                }}
              />
            ) : (
              <TextField
                size="small"
                disabled={disabled}
                value={values[idx] ?? ""}
                onChange={(e) => {
                  const next = [...values];
                  while (next.length < blankCount) next.push("");
                  next[idx] = e.target.value;
                  onChange(next);
                }}
                sx={{
                  display: "inline-flex",
                  width: 120,
                  mx: 0.5,
                  verticalAlign: "middle",
                  "& .MuiInputBase-root": { py: 0.25 },
                }}
                placeholder={`${idx + 1}`}
              />
            )
          )}
        </Box>
      ))}
    </Box>
  );
}

function StackFallback({
  blankCount,
  values,
  onChange,
  disabled,
  preview,
}: Omit<BlankStemRendererProps, "stemHtml">) {
  if (preview) return null;
  return (
    <Box>
      {Array.from({ length: blankCount }).map((_, idx) => (
        <TextField
          key={idx}
          size="small"
          fullWidth
          disabled={disabled}
          label={`جای خالی ${idx + 1}`}
          value={values[idx] ?? ""}
          onChange={(e) => {
            const next = [...values];
            next[idx] = e.target.value;
            onChange(next);
          }}
          sx={{ mb: 1 }}
        />
      ))}
    </Box>
  );
}
