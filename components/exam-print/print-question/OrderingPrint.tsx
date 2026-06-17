"use client";

import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { RichLabel } from "@/components/editor";
import { optionText } from "@/lib/question-types/normalize-question";
import { shuffleIndices } from "@/lib/exam-print/shuffle-items";
import type { OrderingPrintLayout, QuestionPrintSettings } from "@/lib/question-types/print-settings";
import type { PrintQuestionVariant } from "@/lib/question-types/print/types";

const ITEM_LABELS = ["الف", "ب", "پ", "ت", "ث", "ج", "چ", "ح", "خ", "د"];

interface OrderingPrintProps {
  items: Array<string | { text?: string }>;
  questionId: number;
  variant?: PrintQuestionVariant;
  settings?: QuestionPrintSettings;
}

function OrderingTable({
  shuffledIndices,
  items,
  fontSize,
  variant,
}: {
  shuffledIndices: number[];
  items: OrderingPrintProps["items"];
  fontSize: string;
  variant: PrintQuestionVariant;
}) {
  const isPlayful = variant === "playful";
  const cellPy =
    variant === "compact" ? 0.35 : variant === "playful" ? 0.6 : variant === "formal" ? 0.45 : 0.5;

  return (
    <Table
      size="small"
      sx={{
        border: isPlayful ? "2px dashed #999" : "1px solid #000",
        borderRadius: isPlayful ? 1 : 0,
        "& td, & th": {
          border: isPlayful ? "1px dashed #bbb" : "1px solid #000",
          px: variant === "compact" ? 0.75 : 1,
          py: cellPy,
          fontSize,
          verticalAlign: "top",
        },
      }}
    >
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 700 }}>مورد</TableCell>
          <TableCell sx={{ fontWeight: 700, width: 72, textAlign: "center" }}>
            ترتیب
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {shuffledIndices.map((origIdx, displayIdx) => (
          <TableRow key={origIdx}>
            <TableCell>
              <Box sx={{ display: "flex", gap: 0.5, alignItems: "flex-start" }}>
                <Box component="span" sx={{ fontWeight: 700, flexShrink: 0 }}>
                  {ITEM_LABELS[displayIdx] ?? String(displayIdx + 1)}.
                </Box>
                <RichLabel html={optionText(items[origIdx])} fontSize={fontSize} />
              </Box>
            </TableCell>
            <TableCell sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  borderBottom: "1.5px solid #000",
                  minWidth: 36,
                  minHeight: 18,
                  display: "inline-block",
                  mx: "auto",
                }}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function NumberedListLayout({
  shuffledIndices,
  items,
  fontSize,
}: {
  shuffledIndices: number[];
  items: OrderingPrintProps["items"];
  fontSize: string;
}) {
  return (
    <Box sx={{ mt: 0.5 }}>
      {shuffledIndices.map((origIdx, displayIdx) => (
        <Box
          key={origIdx}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            py: 0.5,
            borderBottom: "1px solid #ddd",
          }}
        >
          <Box
            sx={{
              borderBottom: "1.5px solid #000",
              minWidth: 32,
              minHeight: 20,
              flexShrink: 0,
              mt: 0.25,
            }}
          />
          <Box sx={{ display: "flex", gap: 0.5, flex: 1, minWidth: 0 }}>
            <Box component="span" sx={{ fontWeight: 700, flexShrink: 0 }}>
              {ITEM_LABELS[displayIdx] ?? String(displayIdx + 1)}.
            </Box>
            <RichLabel html={optionText(items[origIdx])} fontSize={fontSize} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function BoxesLayout({
  count,
  fontSize,
}: {
  count: number;
  fontSize: string;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
        gap: 1,
        mt: 0.5,
      }}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <Box
          key={idx}
          sx={{
            border: "1px solid #000",
            borderRadius: 0.5,
            p: 0.75,
            minHeight: 52,
            textAlign: "center",
          }}
        >
          <Box sx={{ fontWeight: 700, fontSize, mb: 0.5 }}>{idx + 1}</Box>
          <Box
            sx={{
              borderBottom: "1.5px solid #000",
              minHeight: 18,
              mx: "auto",
              maxWidth: 48,
            }}
          />
        </Box>
      ))}
    </Box>
  );
}

export default function OrderingPrint({
  items,
  questionId,
  variant = "default",
  settings,
}: OrderingPrintProps) {
  const layout: OrderingPrintLayout = settings?.orderingPrintLayout ?? "table";
  const showHint = settings?.showOrderingHint ?? true;
  const shuffledIndices = shuffleIndices(items.length, questionId * 17 + 3);
  const fontSize = variant === "formal" ? "10pt" : variant === "playful" ? "11pt" : "0.9rem";

  const hintText =
    layout === "boxes"
      ? "حروف موارد را به ترتیب صحیح در خانه‌های شماره‌دار بنویسید."
      : layout === "numbered_list"
        ? "شماره ترتیب صحیح (۱، ۲، …) را در ابتدای هر ردیف بنویسید."
        : "شماره ترتیب صحیح (۱، ۲، …) را در ستون «ترتیب» بنویسید.";

  return (
    <Box sx={{ mt: 1 }}>
      {showHint && (
        <Box
          component="p"
          sx={{
            m: 0,
            mb: 0.75,
            fontSize: variant === "formal" ? "9pt" : "0.8rem",
            color: "#444",
            lineHeight: 1.4,
          }}
        >
          {hintText}
        </Box>
      )}

      {layout === "numbered_list" && (
        <NumberedListLayout shuffledIndices={shuffledIndices} items={items} fontSize={fontSize} />
      )}
      {layout === "boxes" && <BoxesLayout count={items.length} fontSize={fontSize} />}
      {layout === "table" && (
        <OrderingTable
          shuffledIndices={shuffledIndices}
          items={items}
          fontSize={fontSize}
          variant={variant}
        />
      )}
    </Box>
  );
}
