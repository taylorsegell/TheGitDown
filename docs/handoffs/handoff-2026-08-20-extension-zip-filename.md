# Handoff: Extension zip saves wrong filename

## Focus

Fix the GitDown Chrome extension so folder downloads save as `{folder}.zip` (e.g. `op-session.zip`), not `download.zip` / `download (1).zip`. Downloads must keep working. User verified popup UI shows the correct name but the browser save dialog / downloaded file still uses a generic name.

## Current state

### Working
- Extension downloads complete (zip bytes are correct).
- Popup correctly detects GitHub paths and shows **Download `{name}.zip`** and **Saved `{name}.zip`** via `zipFileNameFor()` / `buildZipNames` in `@gitdown/core`.
- `npm test -w gitdown` passes (65 tests).
- `npm run ext:build` succeeds → load from `packages/extension/.output/chrome-mv3`.
- Context menu duplicate-id error fixed (`contextMenus.removeAll()` before create in `lib/menu.ts`).
- Extension icons synced to web app orange logo (`src/public/logo.svg` → `packages/extension/public/`).

### Not working (user-verified, latest build)
- **Filename still wrong** on macOS Chrome: Save dialog shows `download (1).zip` while popup says `op-session.zip`.
- Symptom matches **service-worker data-URL fallback**: Chrome ignores `filename` on `data:` URLs → generic `download.zip`.
- User reports latest port-based fix **“literally didn’t change anything”** — port save path likely never runs in production, or user did not reload unpacked extension (confirm first).

### In progress / unverified
- Port-based save architecture landed but **not manually verified** in a live Chrome session with service-worker logging.
- All extension changes are **local / uncommitted** on branch `saga/modernize-gitdown-20260810-0858/integrate` (plus many prior uncommitted files).

## Next steps

1. **Confirm user reloaded** unpacked extension at `packages/extension/.output/chrome-mv3` after last `ext:build` (not source tree).
2. **Instrument the save path** in service worker: log `hasSavePort()`, port connect/disconnect, and whether `saveBlobViaPort` vs data-URL fallback runs. Inspect via `chrome://extensions` → GitDown → Service worker.
3. **Reproduce**: open popup on `github.com/.../tree/.../skills/op-session`, click **Download op-session.zip**, watch SW console.
4. If `hasSavePort()` is false when save runs → fix port wiring (see Key context). If true but filename still wrong → inspect popup host save (`saveZipBlobInPage`).
5. **Recommended simpler fix if port debugging stalls**: move blob save into **popup only** for toolbar flow — popup already open, has `URL.createObjectURL`. Run `downloadGitHubPath` in popup (token via existing messages) and call `saveZipBlobInPage` directly; keep SW+offscreen port only for context-menu downloads.
6. Remove debug logging once fixed. Run `npm test -w gitdown && npm run ext:build`.

## Key context and decisions

### Root cause (confirmed)
- MV3 **service workers lack `URL.createObjectURL`**.
- `chrome.downloads.download({ url: dataUrl, filename })` **does not honor `filename`** on data URLs → `download.zip` + Save As prompt on Mac.
- Blob URL + `downloads.download` **does** honor `filename`, but blob URL must be created in a **page context** (popup or offscreen), not SW.

### Filename logic (already correct)
- Core sets `event.fileName` from path basename via `buildZipNames` / `rootNameFor` in `packages/core/src/githubUrl.ts`.
- Extension UI uses `zipFileNameFor()` in `packages/extension/lib/zipFileName.ts`.
- **Bug is only in the save adapter**, not detection or naming.

### Attempted fixes (chronological — do not repeat blindly)
1. **Data URL from SW** — worked for bytes, wrong filename (original behavior).
2. **Offscreen doc + `runtime.sendMessage`** with data URL → offscreen `chrome.downloads` — failed (`browser.downloads` undefined in offscreen polyfill); silent fallback to data URL.
3. **Offscreen ready handshake + retries** — still wrong filename for user.
4. **Current: port bridge** (`gitdown-save`):
   - Popup/offscreen: `installSavePortHost()` connects port, listens for `SAVE_ZIP`, saves via `saveZipBlobInPage()` (blob URL + `chrome.downloads`, `saveAs: false`).
   - Background: `onConnect` → `bindSavePort(port)`.
   - SW: `downloadBlobZip()` → `saveBlobViaPort()` → posts ArrayBuffer to port; falls back to data URL on failure.

### Likely failure modes for port approach
- **`activePort` null at save time** — popup `connect()` not bound before user clicks Download; race; or port disconnected.
- **Module/bundle duplication** — unlikely but verify `bindSavePort` and `saveBlobViaPort` share same `activePort` in `background.js`.
- **Port message never reaches popup** — verify `onConnect` fires when popup opens (log in `background.ts`).
- **User testing stale build** — very common; output is `.output/chrome-mv3`, not `packages/extension/`.

### Dead ends
- Fixing filename via data URL + `filename` option from SW — Chrome ignores it.
- Relying on `browser.downloads` in offscreen without `chrome.downloads` — throws, triggered fallback.

### Constraints
- No backend. PAT in `chrome.storage.local`. Preserve download/context-menu/popup behavior.
- Hash routing unchanged on website. Extension-only scope for this bug.

## Artifacts

| Path | Role |
| --- | --- |
| `packages/extension/lib/chromeDownloads.ts` | SW save orchestration; port first, data URL fallback |
| `packages/extension/lib/savePort.ts` | Port bridge (`gitdown-save`), `bindSavePort`, `saveBlobViaPort` |
| `packages/extension/lib/installSavePortHost.ts` | Popup/offscreen port listener + save |
| `packages/extension/lib/saveZipInPage.ts` | Blob URL + `downloads.download` in page context |
| `packages/extension/lib/zipFileName.ts` | UI + save name helpers |
| `packages/extension/entrypoints/popup/main.tsx` | Calls `installSavePortHost()` on load |
| `packages/extension/entrypoints/offscreen/main.ts` | Same host for context-menu path |
| `packages/extension/entrypoints/background.ts` | `onConnect` → `bindSavePort` |
| `packages/extension/lib/downloadJob.ts` | Calls `saveBlobZip(event.blob, event.fileName)` on done |
| `packages/core/src/githubUrl.ts` | `buildZipNames` / `rootNameFor` |
| `packages/extension/STORE.md` | Store listing; mentions offscreen permission |
| Prior conversation | [extension work transcript](file:///Users/databased/.cursor/projects/Users-databased-Developer-00-Top-00-Arkitect-TheGitDown/agent-transcripts/a899f8b7-77be-454d-8798-fd5a46fd6375/a899f8b7-77be-454d-8798-fd5a46fd6375.jsonl) |

### Commands
```bash
npm test -w gitdown
npm run ext:build
# Load: packages/extension/.output/chrome-mv3
```

### Repro URL (user)
`https://github.com/sd0xdev/sd0x-harness/tree/.../skills/op-session` — expect `op-session.zip`.

## Suggested skills

| Skill | Reason |
| --- | --- |
| `/handoff` | If handing off again after partial fix |
| `chrome-browser-extension-builder` | MV3 downloads / offscreen / messaging patterns |
| `debugging` | Systematic SW + port instrumentation |
| `implement-specs` | If choosing popup-native save refactor |

## Open questions / risks

- Is the port connected when `saveBlobViaPort` runs? **Must verify with runtime logs** — tests mock ports; they do not catch wiring bugs.
- Should popup-initiated downloads **skip SW save entirely**? Simplest reliable UX; context menu still needs offscreen/port.
- Mac Chrome “Ask where to save” setting may force Save As even with correct filename — distinguish from `download.zip` bug.
- Large zips: port transfers full ArrayBuffer — may hit limits; user’s repro was ~7 KB.
- Do not commit unless user asks; large uncommitted working tree.
