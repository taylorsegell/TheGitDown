# Task 4.1: Browse + deep-link list wireup
- Milestone: 4
- Depends on: none (requires M2+M3 integrated)

## Scope
Change HomePage flow: rename primary button to Browse; on click / deep-link `url` param, run `listGitHubTree` (not `downloadGitHubPath`). Handle `progress`, `ready` (mount tree browser), `redirect`, `fail`. Remove auto-start zip behavior from the deep-link `useEffect`.

## Owned files/surfaces
- `src/pages/HomePage.tsx` (and HomePage tests if present / create `HomePage.test.tsx`)
- Minimal CSS/class tweaks only if required to show the tree region — full restyle is M5

## Interfaces produced/consumed
- Consumes `listGitHubTree`, `RepoTreeBrowser` (download callbacks may be no-op stubs until 4.2, but prefer wiring placeholders that set error “not wired” only if 4.2 not same branch — **this saga runs 4.2 after 4.1 on same integration**; stubs OK if tests for 4.1 don’t require downloads)

## Validation method
unit/integration tests with mocked list generator + typecheck

## Validation criteria (the contract)
1. No code path auto-calls zip download solely because `url` query appeared.
2. Button accessible name/text is `Browse`.
3. Mocked `ready` results in tree names visible in the document.
4. Mocked `redirect` assigns/navigates to archive URL (mock `window.location` or callback seam).
5. Mocked `fail` shows mapped error message.
6. Create Link still builds `#/home?url=…` without starting a download by itself.

## Evidence required
- Test output; note any location mock approach
