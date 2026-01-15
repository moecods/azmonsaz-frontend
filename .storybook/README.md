# Storybook Configuration

## Files

- **main.ts**: Main Storybook configuration
  - Stories paths: `stories/` and `components/**/*.stories.tsx`
  - Framework: `@storybook/nextjs-vite`
  - Addons: Essentials, A11y, Vitest, Docs, Interactions, Links, Viewport
  - Path aliases: `@/` configured for imports

- **preview.tsx**: Preview configuration
  - Decorators: ThemeRegistry and QueryClientProvider
  - Parameters: Controls, Backgrounds, Layout, Docs, A11y

## Stories Location

Stories can be in two locations:
1. `stories/` - Default Storybook examples
2. `components/**/*.stories.tsx` - Component stories

## Running Storybook

```bash
npm run storybook
```

## Building Storybook

```bash
npm run build-storybook
```

