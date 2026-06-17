"use client";

import { Box } from "@mui/material";
import { RichLabel } from "@/components/editor";
import { optionText } from "@/lib/question-types/normalize-question";
import { shuffleIndices } from "@/lib/exam-print/shuffle-items";
import type { MatchingPrintLayout, QuestionPrintSettings } from "@/lib/question-types/print-settings";
import type { PrintQuestionVariant } from "@/lib/question-types/print/types";
import MatchingPrintTable from "./MatchingPrintTable";

const RIGHT_LABELS = ["الف", "ب", "پ", "ت", "ث", "ج", "چ", "ح", "خ", "د"];

interface MatchingPrintProps {
  leftItems: Array<string | { text?: string }>;
  rightItems: Array<string | { text?: string }>;
  questionId: number;
  variant?: PrintQuestionVariant;
  settings?: QuestionPrintSettings;
}

function itemRow(
  label: string,
  item: string | { text?: string },
  fontSize: string,
  key: string | number
) {
  return (
    <Box
      key={key}
      sx={{
        display: "flex",
        gap: 0.5,
        alignItems: "flex-start",
        py: 0.65,
        minHeight: 28,
      }}
    >
      <Box component="span" sx={{ fontWeight: 700, flexShrink: 0, minWidth: 22 }}>
        {label}
      </Box>
      <RichLabel html={optionText(item)} fontSize={fontSize} />
    </Box>
  );
}

function TwoColumnLayout({
  leftItems,
  rightItems,
  shuffledRightIndices,
  fontSize,
  connectZone = false,
}: {
  leftItems: MatchingPrintProps["leftItems"];
  rightItems: MatchingPrintProps["rightItems"];
  shuffledRightIndices: number[];
  fontSize: string;
  connectZone?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: connectZone ? "1fr 56px 1fr" : "1fr 1fr",
        gap: connectZone ? 0 : 2,
        mt: 0.5,
      }}
    >
      <Box>
        <Box sx={{ fontWeight: 700, fontSize, mb: 0.5, borderBottom: "1px solid #000", pb: 0.25 }}>
          ستون الف
        </Box>
        {leftItems.map((item, idx) => itemRow(`${idx + 1}.`, item, fontSize, idx))}
      </Box>

      {connectZone && (
        <Box
          sx={{
            borderLeft: "1px dashed #999",
            borderRight: "1px dashed #999",
            mx: 0.5,
            minHeight: "100%",
          }}
          aria-hidden="true"
        />
      )}

      <Box>
        <Box sx={{ fontWeight: 700, fontSize, mb: 0.5, borderBottom: "1px solid #000", pb: 0.25 }}>
          ستون ب
        </Box>
        {shuffledRightIndices.map((origIdx, displayIdx) =>
          itemRow(
            `${RIGHT_LABELS[displayIdx] ?? String(displayIdx + 1)}.`,
            rightItems[origIdx],
            fontSize,
            origIdx
          )
        )}
      </Box>
    </Box>
  );
}

export default function MatchingPrint({
  leftItems,
  rightItems,
  questionId,
  variant = "default",
  settings,
}: MatchingPrintProps) {
  const layout: MatchingPrintLayout = settings?.matchingPrintLayout ?? "table";
  const shuffledRightIndices = shuffleIndices(rightItems.length, questionId * 31 + 7);
  const fontSize = variant === "formal" ? "10pt" : variant === "playful" ? "11pt" : "0.9rem";

  if (layout === "two_column" || layout === "connect") {
    return (
      <Box sx={{ mt: 1.5 }}>
        <Box
          component="p"
          sx={{
            m: 0,
            mb: 0.75,
            fontSize: variant === "formal" ? "9pt" : "0.8rem",
            color: "#444",
            lineHeight: 1.45,
          }}
        >
          {layout === "connect"
            ? "هر مورد ستون الف را با حرف متناظر در ستون ب با خط وصل کنید."
            : "موارد ستون الف را با حرف متناظر در ستون ب تطبیق دهید."}
        </Box>
        <TwoColumnLayout
          leftItems={leftItems}
          rightItems={rightItems}
          shuffledRightIndices={shuffledRightIndices}
          fontSize={fontSize}
          connectZone={layout === "connect"}
        />
      </Box>
    );
  }

  return (
    <MatchingPrintTable
      leftItems={leftItems}
      rightItems={rightItems}
      shuffledRightIndices={shuffledRightIndices}
      fontSize={fontSize}
    />
  );
}
