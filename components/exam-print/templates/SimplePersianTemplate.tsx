"use client";

import ExamTemplateShell from "./_shared/ExamTemplateShell";
import ExamMetaBlock from "./_shared/ExamMetaBlock";
import QuestionsSection from "./_shared/QuestionsSection";
import type { ExamTemplateProps } from "@/lib/exam-print/types";

export default function SimplePersianTemplate({ exam, printInteraction }: ExamTemplateProps) {
  return (
    <ExamTemplateShell sx={{ padding: "10mm" }}>
      <ExamMetaBlock exam={exam} compact />
      <QuestionsSection exam={exam} variant="minimal" printInteraction={printInteraction} />
    </ExamTemplateShell>
  );
}
