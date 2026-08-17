# Task 5.1: Delete legacy Angular / CDN surface
- Milestone: 5
- Depends on: none (within M5; requires M4 integrated on main saga branch)

## Scope
Remove obsolete static SPA files that are no longer the entry: Angular modules, old `app/home/*`, vendored angular-toastr, unused jquery-era libs, `lib/coffeebutton.js` if unused. Keep `images/` brand assets still referenced by React. Keep `LICENSE`. Ensure Vite `index.html` is the only HTML entry.

## Owned files/surfaces
- Deletion of: `app/**` (if fully replaced), `lib/**` unused, any leftover non-Vite HTML
- May keep `images/**`
- Must not delete `.brain/sagas/**`

## Interfaces produced/consumed
- None

## Validation method
build + rg

## Validation criteria (the contract)
1. `npm run build` exits 0 after deletions.
2. `rg -n "angular|cdn\\.rawgit|angular-toastr|jquery-2\\.2" index.html src dist` (after build) shows no Angular/CDN references in `index.html`, `src`, or `dist`.
3. No `app/home/down-git.js` remains (or repo has zero matches for previous Angular module names `TheGitDownModule`).
4. Must not remove domain tests or `src/domain/**`.

## Evidence required
- List of deleted paths.
- `rg` outputs and `npm run build` transcript.
