---
name: TheGitDown
description: Warm-black plates and a file-tree prune for client-side GitHub zips.
colors:
  background: "#0c0c0c"
  surface: "#141310"
  surface-2: "#1b1a15"
  fg-1: "#ede7da"
  fg-2: "#c9c2b2"
  fg-3: "#8c8576"
  fg-4: "#5b564b"
  border: "#2a2823"
  border-2: "#3a3730"
  line: "rgb(168 156 136 / 0.3)"
  accent: "#da532c"
  accent-2: "#ea6b41"
  accent-soft: "rgba(218, 83, 44, 0.08)"
  ink-bright: "#fff"
  status: "#3d9b74"
  danger: "#e07a7a"
typography:
  display:
    fontFamily: "Quicksand, ui-sans-serif, system-ui, sans-serif"
    fontSize: "46px"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Quicksand, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Quicksand, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Quicksand, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Space Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    letterSpacing: "0.14em"
  control:
    fontFamily: "Space Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    letterSpacing: "0.04em"
  wordmark:
    fontFamily: "Space Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "13px"
    fontWeight: 400
    letterSpacing: "0.04em"
  tree:
    fontFamily: "Space Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "18px"
    fontWeight: 400
  input:
    fontFamily: "Space Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
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
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink-bright}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "14px 22px"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.accent-2}"
    textColor: "{colors.ink-bright}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.fg-1}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "14px 22px"
    height: "2.75rem"
  button-secondary-hover:
    backgroundColor: "transparent"
    textColor: "{colors.fg-1}"
  input:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.fg-1}"
    typography: "{typography.input}"
    rounded: "{rounded.control}"
    padding: "0.85rem 0.95rem"
  plate:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.control}"
    width: "68.75rem"
  tree-target:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.fg-1}"
    typography: "{typography.tree}"
    rounded: "{rounded.control}"
    padding: "6px 10px"
  zip-tag:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.fg-1}"
    typography: "{typography.tree}"
    rounded: "{rounded.control}"
    padding: "3px 10px"
  comment:
    textColor: "{colors.fg-3}"
    typography: "{typography.label}"
  link-mono:
    textColor: "{colors.fg-1}"
    typography: "{typography.control}"
---

# Design System: TheGitDown

## Overview

**Creative North Star: "The Surgical Prune"**

TheGitDown looks like a warm-black engineering plate: one hairline frame, beige ink, and a Space Mono tree that lifts a single folder out of a repo. The first viewport *is* the mechanism — not a slogan parked over a mascot. The visitor sees `assets/` pulse, `assets.zip` drop, and believes the zip happens in this browser. Then they paste a GitHub URL.

Quicksand carries the headline (“Grab the branch. Skip the forest.”) at medium weight; Space Mono runs the rest of the instrument — `gitdown_` in the plate bar, `//` comments, the tree, buttons, and fields. Plates, inputs, and buttons stay square (`0`). Terracotta is the one accent: CTAs, the wordmark cursor, the pruned row, the zip tag. Product name in footer and legal copy remains **TheGitDown**; the hero wordmark is **gitdown_**. Copy stays client-only and honest: public URLs, zip in the browser, no clone, no backend.

**Key Characteristics:**
- Warm near-black canvas and plates, beige ink, one terracotta
- Quicksand for headlines and ledes; Space Mono for wordmark, comments, tree, fields, and buttons
- Square 1px-bordered plates at 1100px (`68.75rem`); footer is open
- Pills only on buttons; tags, inputs, and plates stay square
- Mechanism-first hero: the prune tree is the first viewport
- Hero wordmark `gitdown_`; footer and legal name TheGitDown
- Section voice is lowercase `//` comments, not bracketed callouts
- Flat depth: hairline + a surface step, no card drop-shadows

## Colors

Warm near-black ground, warm beige type, and a single terracotta used as a scalpel — not a fill.

### Primary
- **Terracotta** (`#da532c`): Download CTAs, skip-to-content, the `gitdown_` cursor, tree prefixes on the target row, zip-tag stroke, text selection, focus rings, footer credit underlines. Hover steps to **Terracotta Hover** (`#ea6b41`). Soft wash (`rgba(218, 83, 44, 0.08)`) sits behind the pruned row and the zip tag only.

### Neutral
- **Warm Void** (`#0c0c0c`): Page canvas (`theme-color` matches). Share-link field also sits on this ground inside the plate.
- **Warm Plate** (`#141310`): Hero, download, extension, and legal plates.
- **Nested Pane** (`#1b1a15`): Hero tree column and input fills — one step up from the plate.
- **Beige Ink** (`#ede7da`): Primary text, wordmark, tree target name, buttons at rest (secondary).
- **Warm Body** (`#c9c2b2`): Ledes, extension body, auth title at rest.
- **Muted Comment** (`#8c8576`): `//` comments, dimmed tree rows, footer icons at rest, legal body.
- **Faint Prefix** (`#5b564b`): `//` marker, tree glyphs, field meta, legal “Updated”, zip arrow.
- **Warm Hairline** (`#2a2823`): Every plate and cell stroke. Hover hairline (`#3a3730`) on fields.
- **Drafting Line** (`rgb(168 156 136 / 0.3)`): Page grid and the 11px corner registration marks. Same role as the old sage `--line`, warmed to this canvas.
- **Signal White** (`#fff`): Accent-button text and selection text only — never a page fill.
- **Status** (`#3d9b74`): Progress copy and the square status lamp.
- **Danger** (`#e07a7a`): Invalid URL stroke and error alert.

### Named Rules
**The One Terracotta Rule.** Terracotta marks the prune and the action. It never fills a plate, a page, or a field.

## Typography

**Display Font:** Quicksand (ui-sans-serif, system-ui)
**Body Font:** Quicksand
**Label/Mono Font:** Space Mono (ui-monospace, SFMono-Regular)

**Character:** Quicksand is round and medium, not a condensed display scream. Space Mono is the instrument face — it labels the work, draws the tree, and sets every control.

### Hierarchy
- **Display** (500, 46px / mobile `clamp(2rem, 9vw, 2.5rem)`, 1.02, −0.02em): Hero headline only.
- **Headline** (500, 1.5rem, 1.1, −0.02em): Extension title (“Skip the paste”) and legal H1.
- **Title** (500, 1rem): Auth summary title; token heading (600, 1.05rem) when the details body is open.
- **Body** (400, 1rem, 1.6): Hero lede (max ~380px), extension body (max ~22rem). Legal prose 1.05rem / 1.55, max ~32rem. Small print 0.875rem / 1.55 on the hero foot.
- **Label** (400, 0.8125rem, 0.14em, lowercase): `//` comments (`::before` inserts `// `). Field meta uses the same size at 0.04em tracking.
- **Control** (400, 0.8125rem, 0.04em, uppercase): Buttons and skip link.
- **Wordmark** (400, 13px, 0.04em): `gitdown_` in the hero bar; privacy header uses the same size as `The` + terracotta `GitDown`.
- **Tree** (400, 18px): Hero file tree. Target row is 700.
- **Input** (400, 0.875rem; 16px below 32rem): URL, token, and share fields. Placeholders switch to Quicksand 0.95rem.

### Named Rules
**The Two-Voice Rule.** Quicksand speaks headlines and ledes. Space Mono speaks the tree, comments, wordmark, fields, and buttons.

**The Comment Rule.** Section labels are lowercase source comments (`.m-comment` with a `// ` prefix). They are not marketing eyebrows and not `[ Bracket ]` callouts.

## Layout

Operate column on a warm-black page: padding `1.5rem` / `clamp(1rem, 4vw, 2rem)`, gap `1.5rem` (0.75rem below 44rem). Recurring chrome is a square plate `width: min(68.75rem, 100%)` — 1100px — centered, `1px` hairline, `--surface` fill.

**Hero plate:** Top bar (`16px 32px`) with `gitdown_` left and `// surgical repo downloads` right. Body is two equal columns, min-height 480px; copy and tree pad `48px 44px`; tree column uses `--surface-2` and a left hairline. Foot is a full-width honesty line. Page ground is a 32px drafting grid (`GridPattern`, `--line` stroke) that masks out toward the footer. Each plate carries four 11px corner registration marks (`PlateMarks`) that sit 6px outside the hairline. Below 44rem the bar stacks, the tree drops under a top hairline, the zip hides until `assets/` is expanded.

**Task plate:** Same width and stroke. Inner cells pad `32px` (20px / 24px on narrow). Download controls cap at `32rem`. Actions are `1.4fr / 1fr` until 32rem, then one column. Auth is a collapsed `<details>` row (`16px 32px` summary). Extension plate repeats the language with a copy/CTA split.

**Footer:** Open — no frame. `margin-top: auto` pins it to the viewport bottom of the flex page. Icon targets 2.75rem; product credit names TheGitDown.

**Rhythm:** 4px-rooted `--space-1` through `--space-8`. Interactive controls are at least 2.75rem tall.

### Named Rules
**The Plate Rule.** Chrome is a 1px square plate at `--content-max` (68.75rem). The footer stays open.

## Elevation & Depth

Flat. Depth is a hairline (`--border`) and one tonal step (`--surface` → `--surface-2` on the tree pane and inputs). No drop-shadow on plates, buttons, or fields.

Pulse rings are light, not lift: the pruned row breathes `0 0 0 6px rgba(218, 83, 44, 0.18)`; the progress lamp uses a 3px status halo. Both die under `prefers-reduced-motion`.

### Named Rules
**The Hairline Rule.** Surfaces are flat at rest. A 1px warm border is the only chrome. Glow is a prune/status signal, never a card shadow.

## Shapes

One radius.

Plates, buttons, inputs, progress, errors, tree rows, zip tag, skip link, footer icons: square (`--radius` / `--radius-control: 0`). No pills. The zip tag class may say “pill”; the stroke is square — follow the geometry, not the class name.

Focus is a 2px terracotta ring, 2px offset, on buttons, links, fields, and the tree target.

### Named Rules
**The Square Rule.** Hairline rectangles. Do not round a plate, button, input, or tree tag.

## Components

### Buttons
- **Shape:** Square (`0`), min-height 2.75rem, padding 14px 22px, Space Mono uppercase, 0.04em tracking, 1px stroke, 0.18s color/border/background.
- **Primary:** Terracotta fill, white text. Hover → terracotta hover. Used for Download, Add to Chrome, skip-to-content.
- **Secondary:** Transparent, beige ink, hairline. Hover brightens the border to muted comment. Create Link, Save token, Clear.
- **Disabled:** 0.45 opacity. Focus-visible: 2px terracotta offset ring.
- **Hero vs task:** The hero has no download control. Task primary is “Download” and starts the zip.

### Chips / tags
- **Zip tag:** Square, terracotta hairline, soft terracotta wash, beige name (`assets.zip`). Not a pill.
- **Tree target:** Same wash and stroke, 6px 10px, name at 700. Non-target rows dim on a 4s cascade; target pulses 2.4s; zip drops 3.2s. Narrow: target is a button; zip shows after expand. Reduced motion: settled end state, zip visible.

### Cards / Containers
- **Corner Style:** Square
- **Background:** Plate `--surface`; nested pane `--surface-2`
- **Shadow Strategy:** `--shadow-panel` inset hairline only (not drop shadow)
- **Border:** 1px `--border`, square corners; cells divide with the same stroke
- **Internal Padding:** 32px typical; hero copy 48×44; bar 16×32

### Inputs / Fields
- **Style:** Nested-pane fill, 1px hairline, square, Space Mono value, Quicksand placeholder, terracotta caret
- **Hover:** Border steps to `--border-2`
- **Focus:** 2px terracotta ring, 2px offset
- **Error:** `aria-invalid` → danger stroke; message in one `role="alert"`
- **Share:** Readonly textarea on page background, 0.8rem mono

### Navigation
- **Hero bar:** `gitdown_` + blinking terracotta underscore vs `// surgical repo downloads`. Underscore blink is 1.1s steps; off under reduced motion.
- **Mono link:** Lowercase Space Mono with a blinking `_` in terracotta when a text link is used; hover inks the word terracotta.
- **Footer:** Open row of 2.75rem square icon targets, muted → ink with 1px lift (lift off under reduced motion). Credit sentence names TheGitDown, Taylor Segell, Privacy.
- **Legal header:** Logo + `The` / `GitDown` (accent on GitDown), links home. Not used on the landing hero.

### Tree Prune (signature)
The first viewport. Space Mono listing of `gitdown-app/` with dimmed siblings, a terracotta-boxed `assets/` row, and `↓ assets.zip`. It is the product demonstration, not decoration beside a mascot. The URL form lives in the plate below (`#download`). Honesty line under the split: public GitHub URLs; zip built in this browser.

### Progress / Error
Square insets, not pills. Progress: status-soft fill, status stroke, square lamp. Error: danger text on danger-soft fill.

## Do's and Don'ts

### Do:
- **Do** keep the first viewport as the prune — tree, pulse, zip — with the download form in the plate below.
- **Do** use `gitdown_` (Space Mono 13px, terracotta cursor) as the hero wordmark, and **TheGitDown** in footer and legal copy.
- **Do** label sections with lowercase `//` comments in Space Mono.
- **Do** keep plates square and 1px `--border`, with corner registration marks and a drafting grid on the page ground.
- **Do** honor `prefers-reduced-motion`: no blink, dim, pulse, or zip drop; show the settled tree with the zip visible.

### Don't:
- **Don't** restore a robot, CRT face, or other companion mascot on the landing page.
- **Don't** bring back Outfit, IBM Plex Mono, or bracketed `[ Section ]` labels.
- **Don't** round plates, buttons, inputs, or tree tags.
- **Don't** fill a plate or the page with terracotta, and **Don't** add a second saturated brand accent.
- **Don't** imply a TheGitDown server holds the zip or the token — the product is client-only.
