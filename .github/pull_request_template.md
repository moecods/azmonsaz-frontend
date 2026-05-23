## Summary

<!-- What does this PR change and why? -->

## Checklist

### Code
- [ ] ESLint + `tsc --noEmit` pass
- [ ] Uses shared `lib/validation.ts` for forms (no duplicate Zod schemas)
- [ ] Question UI changes use `QuestionView` / shared primitives when applicable

### Tests
- [ ] `npm run test:run -- --project=unit` passes
- [ ] Cypress updated if user-facing flows changed

### Docs
- [ ] README or CHANGELOG updated if needed

## Test plan

<!-- Steps reviewers can follow -->
