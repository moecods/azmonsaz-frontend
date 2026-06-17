"use client";

import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { RichLabel } from "@/components/editor";
import { optionText } from "@/lib/question-types/normalize-question";

const RIGHT_LABELS = ["الف", "ب", "پ", "ت", "ث", "ج", "چ", "ح", "خ", "د"];

interface MatchingPrintTableProps {
  leftItems: Array<string | { text?: string }>;
  rightItems: Array<string | { text?: string }>;
  shuffledRightIndices: number[];
  fontSize: string;
}

/** Classic table layout: column B legend + rows with answer blanks. */
export default function MatchingPrintTable({
  leftItems,
  rightItems,
  shuffledRightIndices,
  fontSize,
  variant = "default",
}: MatchingPrintTableProps) {
  return (
    <Box sx={{ mt: 1.5 }}>
      {rightItems.length > 0 && (
        <Box
          sx={{
            mb: 1,
            px: 0.5,
            fontSize,
            lineHeight: 1.55,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            columnGap: 1.5,
            rowGap: 0.5,
          }}
        >
          <Box component="span" sx={{ fontWeight: 700, flexShrink: 0 }}>
            ستون ب:
          </Box>
          {shuffledRightIndices.map((origIdx, displayIdx) => (
            <Box
              key={origIdx}
              component="span"
              sx={{ display: "inline-flex", alignItems: "baseline", gap: 0.35 }}
            >
              <Box component="span" sx={{ fontWeight: 700, flexShrink: 0 }}>
                {RIGHT_LABELS[displayIdx] ?? String(displayIdx + 1)}.
              </Box>
              <RichLabel html={optionText(rightItems[origIdx])} fontSize={fontSize} />
            </Box>
          ))}
        </Box>
      )}

      <Table
        size="small"
        sx={{
          border: "1px solid #000",
          "& td, & th": {
            border: "1px solid #000",
            px: 1,
            py: 0.75,
            fontSize,
            verticalAlign: "top",
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, width: "55%" }}>مورد (ستون الف)</TableCell>
            <TableCell sx={{ fontWeight: 700, width: "45%" }}>پاسخ (حرف ستون ب)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leftItems.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "flex-start" }}>
                  <Box component="span" sx={{ fontWeight: 700, flexShrink: 0 }}>
                    {idx + 1}.
                  </Box>
                  <RichLabel html={optionText(item)} fontSize={fontSize} />
                </Box>
              </TableCell>
              <TableCell>
                <Box
                  sx={{
                    borderBottom: "1.5px solid #000",
                    minWidth: 72,
                    minHeight: 20,
                    display: "inline-block",
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
