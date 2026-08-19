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
  faint: "#7a8a88"
  accent: "#DA532C"
  robot-glow: "#5eead4"
  status: "#3d9b74"
  danger: "#e07a7a"
  focus-ring: "#d4dcdb"
  ink-bright: "#ffffff"
  hover-mix: "#6a8580"
  hover-surface: "#1a2222"
typography:
  display:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 8vw, 5.5rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.55
  title:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 500
  control:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 500
  input:
    fontFamily: "IBM Plex Mono, ui-monospace, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
  input-placeholder:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.95rem"
  input-mobile:
    fontFamily: "IBM Plex Mono, ui-monospace, Menlo, Monaco, Consolas, monospace"
    fontSize: "16px"
  caption:
    fontFamily: "IBM Plex Mono, ui-monospace, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.8rem"
  meta:
    fontFamily: "IBM Plex Mono, ui-monospace, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.75rem"
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    letterSpacing: "0.06em"
rounded:
  control: "0px"
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
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.ink-bright}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.control}"
    padding: "0.7rem 1rem"
    height: "2.75rem"
---

# Design System: TheGitDown

## Overview

**Creative North Star: "The Blueprint Terminal"**

TheGitDown reads like an engineering schematic printed for a night shift: near-black ground, a single hairline frame with corner cross-marks around the one task that matters, IBM Plex Mono labels bracketed like `[ Download ]` annotating each region, and Outfit carrying the display voice. It is honest and unadorned — the product is client-only and has exactly one job, and the interface never pretends otherwise. Nothing simulates data that isn't real; nothing hides the task behind decoration.

A small square CRT face sits in the hero, above the download frame — a companion drawn in the tool's own language (square corners, hairline border, `--surface-raised` fill), not a second landing page. Its two `--robot-glow` lamps track the pointer. Tapping the face is the page's one authored moment of delight.

**Key Characteristics:**
- Near-black ground, hairline borders, corner cross-marks as the only "chrome"
- Mono labels (`[ Section ]`) as blueprint-style callouts, never marketing kickers
- One accent (`--accent`, warm orange-red) used sparingly for links, labels, and emphasis
- A second, narrowly-scoped glow color (`--robot-glow`, teal) reserved for the robot face's lamps
- Flat surfaces; depth comes from a single hairline border, not shadows
- One control shape: square (`--radius-control: 0`) — buttons, inputs, frame, and the robot chassis
- No 3D/WebGL anywhere in the app — every visual, including the robot, is CSS/SVG/DOM

## Colors

Two accents, deliberately kept apart: one warm (product/action), one cool (the robot's own material).

### Primary
- **Signal Orange**: the one accent. Section labels (`[ Download ]`), the wordmark's second word, footer credit links. Used sparingly — never a full-surface fill.

### Secondary
- **Robot Glow**: reserved strictly for the robot face's lamps (eyes / heart). It never fills a UI control.

### Neutral
- **Ink**: primary text, primary-button fill (inverted: ink background, `--bg` text). Hover on inverted fills goes to **Ink Bright**.
- **Ink Secondary**: secondary-button text.
- **Muted**: body copy, taglines.
- **Faint**: mono meta labels, hints, and footer prose — the quietest *readable* tier. Must stay ≥4.5:1 on `--bg` and `--surface-raised`; never use it for primary content.
- **Background**: page ground.
- **Surface / Surface Raised**: input fields, panel fills.
- **Border / Line**: hairline dividers and the schematic frame.

### Named Rules
**The One Job Rule.** No decorative gradient, glass, or motion may compete with the URL input or the Download action — they stay the visual anchor of every viewport they appear in.

## Typography

**Display Font:** Outfit (with ui-sans-serif, system-ui fallback)
**Body Font:** Outfit
**Label/Mono Font:** IBM Plex Mono

**Character:** Outfit carries weight and warmth at display size (800-weight wordmark, tight -0.03em tracking); IBM Plex Mono handles every technical annotation — section labels, field meta, hints — so the reader always knows which register they're in.

### Hierarchy
- **Display** (800, fluid clamp): the "TheGitDown" wordmark; only appearance in the hero.
- **Body** (400, 1.05rem, 1.55 line-height): tagline and any prose copy; max ~32rem measure.
- **Title** (500, 0.95rem): auth summary title and similar section names.
- **Control** (500–600, 0.9rem): buttons, skip link, error copy.
- **Input** (mono 0.875rem; 16px on narrow viewports to avoid iOS focus-zoom): URL and token fields.
- **Caption** (mono 0.8rem): progress, share link, footer credit sentence.
- **Meta** (mono 0.75rem): hero license line, token status.
- **Label** (500, 0.6875rem, 0.06em tracking, mono): section callouts (`[ Download ]`, `[ Auth ]`, `[ Open Source ]`) and field meta rows.

### Named Rules
**The Bracket Rule.** Mono labels are always wrapped in `[ Text ]` and always sit as a structural callout for the section beneath them, never as a persuasive eyebrow over a headline.

## Layout

Single centered column, `--content-max: 36rem`, with page padding `clamp(1rem, 4vw, 2rem)`. Page ground is `--bg` plus a hairline drafting grid (`src/ui/GridPattern.tsx`, 32px cells, `--line` stroke) that masks out toward the footer so it never competes with the URL field. The hero is open (no frame): label, wordmark, tagline, then the robot companion at a larger scale. The schematic frame holds only the download task and the collapsible auth row — that frame hugs its content, fills `--bg` so the grid does not show through, and does not stretch to fill the viewport. Footer is open and sits at the bottom of the viewport (`margin-top: auto` in the page flex column). Spacing follows a 4px-rooted scale (`--space-1` through `--space-8`). Interactive controls are at least 2.75rem tall.

## Elevation & Depth

Flat by default. The only "depth" device is a single hairline border (`--line`) plus four corner cross-marks framing the download panel, echoing a technical drawing's registration marks rather than a card shadow. The robot's lamps may glow; the chassis does not cast a card shadow.

### Named Rules
**The Flat-By-Default Rule.** No `box-shadow` implies elevation on chrome. Lamp glow on the robot eyes is light, not a card.

## Shapes

One family. `--radius-control: 0` on inputs, buttons, the schematic frame, and the robot chassis — measuring-instrument, not consumer-app. The eyes are square lamps on a square screen; roundness is not a second vocabulary.

## Components

### Buttons
- **Shape:** square corners (`--radius-control: 0`), min-height 2.75rem
- **Primary:** `--ink` background / `--bg` text, 600 weight; hover inverts to `--ink-bright`
- **Secondary:** transparent, `--ink-secondary` text, `--border` outline

### Inputs / Fields
- **Style:** `--surface-raised` fill, `--border` outline, mono value type, sans placeholder
- **Focus:** `2px solid --focus-ring`, `2px` offset
- **Error:** `aria-invalid` on the field; message in a single `role="alert"` bound with `aria-describedby`

### Navigation (footer)
- Square 2.75rem icon targets, `--muted` at rest, `--ink` + 1px lift on hover, all icons authored inline SVG in `currentColor` (GitHub, LinkedIn, personal site, Buy Me a Coffee)
- Icon-only links name the destination and that they open in a new tab

### Robot Companion (signature component)
A CSS/DOM robot face (`src/ui/RobotHero.tsx`) drawn as a schematic device in the hero, above the download frame. Square chassis, `--surface-raised` fill, `--border` stroke — the same tokens as the URL field. Two `--robot-glow` lamps track the pointer (`pointermove`, rAF-throttled; skipped under `prefers-reduced-motion` or without a fine pointer). Tap swaps the lamps for a heart for two seconds. Hint copy is a mono caption, not a badge. GitHub lives in the footer; there is no second nav on the companion.

## Do's and Don'ts

### Do:
- **Do** keep `--accent` (orange) and `--robot-glow` (teal) semantically separate — orange is the site's one action/emphasis color, teal belongs only to the robot lamps.
- **Do** use square corners (`--radius-control: 0`) on every control and on the robot chassis.
- **Do** keep mono labels bracketed (`[ Section ]`) as structural callouts, not headline eyebrows.
- **Do** keep the companion in the hero and the download task in the schematic frame — one language, two roles. The optional token lives in a `<details>` row that collapses the body (and the frame) when closed.
- **Do** honor `prefers-reduced-motion`: skip spatial movement (scroll, entrance rise, hover translate) while keeping color and focus state changes.

### Don't:
- **Don't** reach for a WebGL/3D dependency for decorative elements on this site again without a strong reason — the original 3D robot was reverted specifically because it was unreliable (context loss) and heavy (~380KB) for a purely decorative touch; the CSS/DOM face achieves the same charm at near-zero cost.
- **Don't** add a second saturated accent outside `--accent` and `--robot-glow` without a documented reason; the palette's restraint is the point.
- **Don't** give ordinary cards or panels a soft shadow; depth here is a hairline border and corner marks, not elevation.
- **Don't** introduce a second control shape (pills, glass, marketing CTAs) beside the square schematic.
- **Don't** put two controls on the page that share the accessible name "Download" but do different jobs.
