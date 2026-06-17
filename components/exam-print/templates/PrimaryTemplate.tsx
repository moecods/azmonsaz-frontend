"use client";

import ExamTemplateShell from "./_shared/ExamTemplateShell";
import SchoolHeader from "./_shared/SchoolHeader";
import ExamMetaBlock from "./_shared/ExamMetaBlock";
import QuestionsSection from "./_shared/QuestionsSection";
import type { ExamTemplateProps } from "@/lib/exam-print/types";

export default function PrimaryTemplate({ exam, headerOverrides, printInteraction }: ExamTemplateProps) {
  return (
    <ExamTemplateShell>
      <SchoolHeader exam={exam} header={headerOverrides} showBismillah />
      <ExamMetaBlock exam={exam} compact />
      <QuestionsSection exam={exam} variant="default" printInteraction={printInteraction} />
    </ExamTemplateShell>
  );
}
