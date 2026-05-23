import type { ComponentType } from "react";
import type { QuestionTypeId } from "../constants";
import type { QuestionTypeKind } from "../registry";
import type { DisplaySettings } from "../display-settings";

export interface EditorFormProps {
  control: unknown;
  errors: unknown;
  [key: string]: unknown;
}

export interface AnswerInputProps {
  payload: Record<string, unknown>;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  displaySettings?: DisplaySettings;
}

export interface DisplayViewProps {
  source: Record<string, unknown>;
  mode?: "bank" | "manage" | "print" | "preview";
  showAnswerKey?: boolean;
  compact?: boolean;
}

export interface ResultViewProps {
  question: Record<string, unknown>;
}

export interface QuestionTypePlugin {
  id: QuestionTypeId;
  kind: QuestionTypeKind;
  labelFa: string;
  defaultDisplaySettings?: Partial<DisplaySettings>;
}
