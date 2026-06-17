"use client";

import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { isEssay } from "@/lib/question-types";
import type { NormalizedQuestion } from "@/lib/question-types/normalize-question";
import type { QuestionTypeKind } from "@/lib/question-types/registry";
import { getTeacherKeyFormatter } from "@/lib/question-types/print/registry";
import type { QuestionPrintStrategy, StudentPrintContext } from "@/lib/question-types/print/types";
import BlankStemRenderer from "@/components/questions/answer/BlankStemRenderer";
import OptionsPrint from "./print-question/OptionsPrint";
import MatchingPrint from "./print-question/MatchingPrint";
import OrderingPrint from "./print-question/OrderingPrint";
import EssayPrint from "./print-question/EssayPrint";
import ShortAnswerPrint from "./print-question/ShortAnswerPrint";

type StudentPrintRenderer = (
  question: NormalizedQuestion,
  context: StudentPrintContext
) => ReactNode;

function renderOptionsPrint(question: NormalizedQuestion, context: StudentPrintContext): ReactNode {
  const { variant } = context;
  if (question.options.length === 0) return null;
  return (
    <OptionsPrint
      options={question.options}
      variant={variant}
      displaySettings={question.display_settings}
      columns={variant === "compact" ? 2 : undefined}
    />
  );
}

function renderMatchingPrint(question: NormalizedQuestion, context: StudentPrintContext): ReactNode {
  const { questionId, variant, printSettings } = context;
  if (question.left_items.length === 0) return null;
  return (
    <MatchingPrint
      leftItems={question.left_items}
      rightItems={question.right_items}
      questionId={questionId}
      variant={variant}
      settings={printSettings}
    />
  );
}

function renderOrderingPrint(question: NormalizedQuestion, context: StudentPrintContext): ReactNode {
  const { questionId, variant, printSettings } = context;
  if (question.items.length === 0) return null;
  return (
    <OrderingPrint
      items={question.items}
      questionId={questionId}
      variant={variant}
      settings={printSettings}
    />
  );
}

function renderBlanksPrint(question: NormalizedQuestion): ReactNode {
  return (
    <Box sx={{ mt: 1 }}>
      <BlankStemRenderer
        stemHtml={question.text}
        blankCount={Math.max(question.blanks.length, 1)}
        values={[]}
        onChange={() => {}}
        disabled
        preview
      />
    </Box>
  );
}

function renderTextPrint(question: NormalizedQuestion, context: StudentPrintContext): ReactNode {
  const { variant, printSettings } = context;
  if (isEssay(question.type)) {
    return <EssayPrint variant={variant} settings={printSettings} />;
  }
  return <ShortAnswerPrint variant={variant} settings={printSettings} />;
}

const studentRenderByKind: Record<QuestionTypeKind, StudentPrintRenderer> = {
  options_single: renderOptionsPrint,
  options_multiple: renderOptionsPrint,
  options_fixed: renderOptionsPrint,
  matching: renderMatchingPrint,
  ordering: renderOrderingPrint,
  blanks: renderBlanksPrint,
  text: renderTextPrint,
};

function buildStrategy(kind: QuestionTypeKind): QuestionPrintStrategy {
  return {
    kind,
    formatTeacherKeyAnswer: getTeacherKeyFormatter(kind),
    renderStudentPrint: studentRenderByKind[kind],
  };
}

const printStrategies: Record<QuestionTypeKind, QuestionPrintStrategy> = {
  options_single: buildStrategy("options_single"),
  options_multiple: buildStrategy("options_multiple"),
  options_fixed: buildStrategy("options_fixed"),
  matching: buildStrategy("matching"),
  ordering: buildStrategy("ordering"),
  blanks: buildStrategy("blanks"),
  text: buildStrategy("text"),
};

export function getPrintStrategy(kind: QuestionTypeKind): QuestionPrintStrategy {
  return printStrategies[kind];
}

export function renderStudentPrint(
  question: NormalizedQuestion,
  context: StudentPrintContext
): ReactNode {
  if (context.showStemOnly || !question.kind) return null;
  return getPrintStrategy(question.kind).renderStudentPrint(question, context);
}
