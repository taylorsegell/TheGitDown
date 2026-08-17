# Milestone 5: Tailwind shell restyle
- Saga: download-file-tree-20260812-1150
- Depends on: 01-tailwind-shadcn, 04-browse-flow-integration

## Goal
Make the entire visible SPA Tailwind-native: hero, form, token settings, tree region, footer credits — preserving dark-green brand and TheGitDown mark. Remove dependency on the legacy `styles.css` design system.

## Milestone validation criteria
1. `src/main.tsx` does not import the old monolithic `styles.css` (file deleted or reduced to a deprecated empty stub removed).
2. HomePage + TokenSettings use Tailwind utilities / shared token classes; shadcn Button used for primary actions.
3. Brand mark + tagline remain hero-level; layout works on mobile width (stacked tree).
4. Build/test/typecheck pass; browse behavior from M4 unchanged.

## Tasks
- 01-restyle-home-token — restyle HomePage + TokenSettings; delete legacy CSS system; depends on: none
