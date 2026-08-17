# Task 2.2: Minimal React entry + brand tokens
- Milestone: 2
- Depends on: 2.1

## Scope
Replace the **Vite-served** entry with a React mount. Port existing CSS variables (`--lightblk`, `--blk`, `--lightgreen`, `--darkgreen`) into `src/styles.css`. Show brand “TheGitDown” as a hero-level signal on the first viewport (placeholder layout OK). Keep legacy `index.html` at repo root only if needed for non-Vite serving — prefer Vite `index.html` at repo root per Vite convention; if root `index.html` is overwritten, leave legacy angular files unused on disk until M5.

Hash router: install and wire `react-router-dom` with **HashRouter**; default route renders the placeholder home. Deep-link query parsing can wait until M4, but `#/home` should resolve to the home placeholder.

## Owned files/surfaces
- `index.html` (Vite entry)
- `src/main.tsx`
- `src/App.tsx` (or `src/app/App.tsx`)
- `src/styles.css` (or `src/app/styles.css`)
- `src/pages/HomePage.tsx` (placeholder)
- Router wiring file if separate

## Interfaces produced/consumed
- Hash routes: `/` redirects to `/home`; `/home` renders HomePage placeholder.
- CSS variables from legacy `:root` preserved under the same names.

## Validation method
build + manual browser checklist

## Validation criteria (the contract)
1. `npm run build` exits 0.
2. `npm run preview` (or dev) — document URL; page title or visible H1/brand text includes `TheGitDown`.
3. Navigating to `/#/home` shows the home placeholder (not a blank router error).
4. Built `dist/index.html` does not reference Angular, Bootstrap CDN, jQuery, or cdn.rawgit.
5. Must not implement download yet (no GitHub calls in this task).

## Evidence required
- `npm run build` transcript.
- Screenshot or HTML snippet showing brand text (screenshot preferred if available; else `curl` of preview HTML + note).
