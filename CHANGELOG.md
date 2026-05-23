# Changelog

All notable changes to the Azmoon-Saz frontend are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Unified question display stack: `QuestionDisplay`, `QuestionStem`, `QuestionAnswerKey`, `OptionsList`.
- Question authoring: `DisplaySettingsPanel`, `QuestionTypeSelector`, type-specific forms, live preview.
- Question type colors in bank lists (`type-appearance.ts`, `QuestionTypeChip`).
- `display_settings` sent on bank question create/update; loaded via `question-mappers`.
- Exam form wizard improvements (scheduling, grading settings).
- Profile avatar upload UI; theme split (`ColorModeProvider`, `createAppTheme`).

### Changed

- Answer/result option styling: correct answers use green border only; wrong options borderless.
- `QuestionResultDisplay` and `OptionsList` share border-highlight patterns.

### Environment

- See `.env.example` for required variables.
