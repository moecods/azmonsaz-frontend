"use client";

import type { NormalizedQuestion } from "@/lib/question-types/normalize-question";
import type { StudentPrintContext } from "@/lib/question-types/print/types";
import { renderStudentPrint } from "./print-strategy";

interface StudentPrintContentProps {
  question: NormalizedQuestion;
  context: StudentPrintContext;
}

/** Student exam sheet — delegates to per-kind print strategy. */
export default function StudentPrintContent({ question, context }: StudentPrintContentProps) {
  return renderStudentPrint(question, context);
}
