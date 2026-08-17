# Task 4.3: Functional visual refresh + remove contact
- Milestone: 4
- Depends on: 4.1

## Scope
Polish HomePage layout for desktop and mobile using existing dark-green tokens (`--blk`, `--lightblk`, `--lightgreen`, `--darkgreen`). Brand “TheGitDown” remains the hero-level signal. Improve input/button focus styles and progress/error readability. Ensure dead contact form is **not** present. Keep one-job composition (URL + actions + progress/errors + token settings + footer credits). Do not introduce purple gradients or generic AI aesthetic clichés; stay on existing brand colors.

Footer: keep GitHub/LinkedIn/site credits and buymeacoffee if images exist; copyright may update to current owner attribution already in README.

## Owned files/surfaces
- `src/styles.css`
- `src/pages/HomePage.tsx` / related presentational components
- `images/` assets as referenced (do not delete brand SVGs)

## Interfaces produced/consumed
- None new

## Validation method
manual browser checklist + build

## Validation criteria (the contract)
1. `npm run build` exits 0.
2. First viewport includes brand mark/text “TheGitDown”, one short supporting line, URL field, Download + Create Link actions (token settings may be secondary below fold).
3. No contact Name/Email/Message fields in DOM.
4. Viewport width 375px: input and buttons usable (no horizontal overflow from main controls).
5. Focus visible on input and buttons (outline or equivalent).

## Evidence required
- Screenshots or detailed manual notes at desktop + ~375px width.
- Confirmation contact fields absent (`rg -n "Contact Me|placeholder=\\\"Name\\\"" src` exits 1).
