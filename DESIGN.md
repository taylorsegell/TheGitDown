---
name: TheGitDown
description: A dark schematic tool for turning a GitHub URL into a zip, with a pointer-tracking robot companion.
colors:
  bg: "#0b0e0e"
  surface: "#121717"
  surface-raised: "#161b1b"
  border: "#2a3535"
  ink: "#f5f7f7"
  ink-secondary: "#c8d0cf"
  muted: "#8b9896"
  faint: "#5c6b69"
  accent: "#e85d4c"
  robot-glow: "#5eead4"
  status: "#3d9b74"
  danger: "#e07a7a"
  focus-ring: "#d4dcdb"
typography:
  display:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 9vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    letterSpacing: "0.06em"
rounded:
  control: "0px"
  pill: "999px"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.5rem"
  6: "2rem"
  7: "2.5rem"
  8: "3.5rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bg}"
    rounded: "{rounded.control}"
    padding: "0.7rem 1rem"
  button-primary-hover:
    backgroundColor: "#ffffff"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.control}"
    padding: "0.7rem 1rem"
  pill-ghost:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bg}"
    rounded: "{rounded.pill}"
    padding: "0.6rem 1.1rem"
  pill-cta:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.bg}"
    rounded: "{rounded.pill}"
    padding: "0.6rem 1.1rem"
---

# Design System: TheGitDown

## Overview

**Creative North Star: "The Blueprint Terminal"**

TheGitDown reads like an engineering schematic printed for a night shift: near-black ground, a single hairline frame with corner cross-marks around the one task that matters, IBM Plex Mono labels bracketed like `[ Download ]` annotating each region, and Outfit carrying the display voice. It is honest and unadorned — the product is client-only and has exactly one job, and the interface never pretends otherwise. Nothing simulates data that isn't real; nothing hides the task behind decoration.

Into that world, a small robot face sits between the hero and the download form as a companion, not a mascot store-front. It started as a full procedural 3D robot (Three.js / React Three Fiber), but that turned out to be an unreliable dependency for a static, client-only tool: it could lose its WebGL context and render blank after long dev sessions, and it added ~380KB of JS for a purely decorative element. It was rebuilt as plain CSS/DOM — the same rounded "screen and ears" face, now scaled up as the section's centerpiece, with its two eye-dots tracking the pointer via a lightweight `pointermove` listener instead of a 3D scene. The floating nav pills above it reuse the exact primary-button treatment (`--ink` on `--bg`) already established for the rest of the page, so the component feels native rather than pasted in.

**Key Characteristics:**
- Near-black ground, hairline borders, corner cross-marks as the only "chrome"
- Mono labels (`[ Section ]`) as blueprint-style callouts, never marketing kickers
- One accent (`--accent`, warm orange-red) used sparingly for links, labels, and emphasis
- A second, narrowly-scoped glow color (`--robot-glow`, teal) reserved for the robot face's own screen material
- Flat surfaces; depth comes from a single hairline border, not shadows
- No 3D/WebGL anywhere in the app — every visual, including the robot, is CSS/SVG/DOM

## Colors

Two accents, deliberately kept apart: one warm (product/action), one cool (the robot's own material).

### Primary
- **Signal Orange** (`#e85d4c`): the one accent. Section labels (`[ Download ]`), the wordmark's second word, footer credit links. Used sparingly — never a full-surface fill.

### Secondary
- **Robot Glow** (`#5eead4`): reserved strictly for the robot face's own screen — its two pointer-tracking eyes and the heart icon it swaps to on tap. It never fills a UI control; the moment it did (an earlier draft used it for the "Download" pill), it read as a second competing accent, so it was pulled back to being purely the robot's material.

### Neutral
- **Ink** (`#f5f7f7`): primary text, primary-button fill (inverted: ink background, `--bg` text).
- **Ink Secondary** (`#c8d0cf`): secondary-button text.
- **Muted** (`#8b9896`): body copy, taglines.
- **Faint** (`#5c6b69`): mono meta labels, hints — the quietest tier of text, used only for supplementary detail, never primary content.
- **Background** (`#0b0e0e`): page ground.
- **Surface / Surface Raised** (`#121717` / `#161b1b`): input fields, panel fills.
- **Border / Line** (`#2a3535` / `rgb(120 160 155 / 0.28)`): hairline dividers and the schematic frame.

### Named Rules
**The One Job Rule.** No decorative gradient, glass, or motion may compete with the URL input or the Download action — they stay the visual anchor of every viewport they appear in.

## Typography

**Display Font:** Outfit (with ui-sans-serif, system-ui fallback)
**Body Font:** Outfit
**Label/Mono Font:** IBM Plex Mono

**Character:** Outfit carries weight and warmth at display size (800-weight wordmark, tight -0.03em tracking); IBM Plex Mono handles every technical annotation — section labels, field meta, hints — so the reader always knows which register they're in.

### Hierarchy
- **Display** (800, `clamp(2.75rem, 9vw, 6rem)`, 0.95 line-height): the "TheGitDown" wordmark; only appearance in the hero.
- **Body** (400, 1.05rem, 1.55 line-height): tagline and any prose copy; max ~32rem measure.
- **Label** (500, 0.6875rem, 0.06em tracking, mono): section callouts (`[ Download ]`, `[ Auth ]`, `[ Open Source ]`) and field meta rows.

### Named Rules
**The Bracket Rule.** Mono labels are always wrapped in `[ Text ]` and always sit as a structural callout for the section beneath them, never as a persuasive eyebrow over a headline.

## Layout

Single centered column, `--content-max: 36rem`, with page padding `clamp(1rem, 4vw, 2rem)`. The hero and footer are open (no frame); the download task and the robot section are the only full-bleed/framed regions, which is what visually marks them as "the product." The robot section runs `clamp(22rem, 40vw, 34rem)` tall — sized off viewport *width*, never `vh`/`dvh`: a viewport-height-based size here can feed back into full-page screenshot tools that resize the viewport to fit page content, growing the section without bound. Spacing follows a 4px-rooted scale (`--space-1` through `--space-8`, 0.25rem–3.5rem).

## Elevation & Depth

Flat by default. The only "depth" device is a single hairline border (`--line`) plus four corner cross-marks framing the download panel, echoing a technical drawing's registration marks rather than a card shadow. The robot's CTA pill is the one exception: a soft offset glow (`0 6px 24px`, tinted `--accent`) on hover, standing in for the elevation a real button press would have.

### Named Rules
**The Flat-By-Default Rule.** No `box-shadow` implies elevation anywhere except the robot CTA's hover state, which glows in the site's one accent color rather than a generic card shadow.

## Shapes

Two families, deliberately opposed. The tool itself is square: `--radius-control: 0` on inputs, buttons, and the schematic frame — measuring-instrument, not consumer-app. The robot's own nav pills are fully rounded (`999px`) — small controls only, matching the floor's "pills are for small controls" rule and visually marking that region as the robot's own material vocabulary within the otherwise square-cornered site.

## Components

### Buttons
- **Shape:** square corners (`--radius-control: 0`)
- **Primary:** `--ink` background / `--bg` text, 600 weight; hover inverts to pure white
- **Secondary:** transparent, `--ink-secondary` text, `--border` outline

### Pills (robot nav only)
- **Ghost pill:** `--ink` on `--bg` (same treatment as the primary button, just rounded) — used for the GitHub link
- **CTA pill:** `--accent` background, `--bg` text — the same orange that already marks `[ Download ]` and the wordmark, so the robot's own "Download" action reads as the same action, not a second brand color

### Inputs / Fields
- **Style:** `--surface-raised` fill, `--border` outline, mono value type, sans placeholder
- **Focus:** `2px solid --focus-ring`, `2px` offset

### Navigation (footer)
- Square 2.75rem icon targets, `--muted` at rest, `--ink` + 1px lift on hover, all icons authored inline SVG in `currentColor` (GitHub, LinkedIn, personal site, Buy Me a Coffee)

### Robot Companion (signature component)
A CSS/DOM robot face (`src/ui/RobotHero.tsx`) — no 3D, no canvas, no runtime dependency beyond React. Two ear nubs, a rounded glass-panel head, and a dark screen holding two `--robot-glow` eye-dots that track the pointer (`pointermove`, throttled via `requestAnimationFrame`, clamped to a few pixels of travel, and skipped entirely under `prefers-reduced-motion` or on touch-only/no-fine-pointer devices). Tapping the face triggers a 2-second heart-icon state on the same screen — the page's one authored moment of delight. The floating nav above it holds exactly two actions (GitHub, Download); "Download" smooth-scrolls to and focuses the real URL input rather than duplicating any download logic.

## Do's and Don'ts

### Do:
- **Do** keep `--accent` (orange) and `--robot-glow` (teal) semantically separate — orange is the site's one action/emphasis color, teal belongs only to the robot face's own screen.
- **Do** use square corners (`--radius-control: 0`) everywhere except small pill controls.
- **Do** keep mono labels bracketed (`[ Section ]`) as structural callouts, not headline eyebrows.
- **Do** size sections off `vw`/fixed values, never `vh`/`dvh` — see the Layout section's note on the screenshot-feedback bug this caused once already.

### Don't:
- **Don't** reach for a WebGL/3D dependency for decorative elements on this site again without a strong reason — the original 3D robot was reverted specifically because it was unreliable (context loss) and heavy (~380KB) for a purely decorative touch; the CSS/DOM face achieves the same charm at near-zero cost.
- **Don't** add a second saturated accent outside `--accent` and `--robot-glow` without a documented reason; the palette's restraint is the point.
- **Don't** give ordinary cards or panels a soft shadow; depth here is a hairline border and corner marks, not elevation.
