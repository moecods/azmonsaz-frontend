"use client";

import type { ReactElement } from "react";
import type { ExamTemplateId, ExamTemplateProps, PrintHeaderOverrides, PrintInteractionOptions } from "@/lib/exam-print/types";
import FormalSchoolTemplate from "./templates/FormalSchoolTemplate";
import PreschoolTemplate from "./templates/PreschoolTemplate";
import PrimaryPlayfulTemplate from "./templates/PrimaryPlayfulTemplate";
import PrimaryTemplate from "./templates/PrimaryTemplate";
import MiddleSchoolTemplate from "./templates/MiddleSchoolTemplate";
import HighSchoolTemplate from "./templates/HighSchoolTemplate";
import CollegeTemplate from "./templates/CollegeTemplate";
import PersianCollegeTemplate from "./templates/PersianCollegeTemplate";
import ModernTemplate from "./templates/ModernTemplate";
import ClassicTemplate from "./templates/ClassicTemplate";
import SimplePersianTemplate from "./templates/SimplePersianTemplate";
import CompactTemplate from "./templates/CompactTemplate";

export function renderExamTemplate(
  templateId: ExamTemplateId,
  exam: ExamTemplateProps["exam"],
  headerOverrides?: PrintHeaderOverrides,
  printInteraction?: PrintInteractionOptions
): ReactElement {
  const props: ExamTemplateProps = { exam, headerOverrides, printInteraction };

  switch (templateId) {
    case "formal_school":
      return <FormalSchoolTemplate {...props} />;
    case "preschool":
      return <PreschoolTemplate {...props} />;
    case "primary_playful":
      return <PrimaryPlayfulTemplate {...props} />;
    case "primary":
      return <PrimaryTemplate {...props} />;
    case "middle_school":
      return <MiddleSchoolTemplate {...props} />;
    case "high_school":
      return <HighSchoolTemplate {...props} />;
    case "college":
      return <CollegeTemplate {...props} />;
    case "persian_college":
      return <PersianCollegeTemplate {...props} />;
    case "modern":
      return <ModernTemplate {...props} />;
    case "classic":
      return <ClassicTemplate {...props} />;
    case "simple_persian":
      return <SimplePersianTemplate {...props} />;
    case "compact":
      return <CompactTemplate {...props} />;
    default:
      return <FormalSchoolTemplate {...props} />;
  }
}
