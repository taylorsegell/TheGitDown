# GitDown — Chrome Web Store / AMO listing kit

Version **1.0.0**. Privacy policy: https://gitdown.xyz/privacy.html

Package zips (after `npm run ext:zip` / `npm run ext:zip:firefox`) land in `packages/extension/.output/`.

## Chrome Web Store

### Store listing

**Name:** GitDown

**Short description (manifest):** Download a GitHub file or folder as a zip from the current tab.

**Category:** Developer Tools

**Language:** English

**Homepage:** https://gitdown.xyz

**Support:** https://github.com/taylorsegell/TheGitDown/issues

**Official URL (after Search Console verify):** https://gitdown.xyz

**Detailed description:**

```
GitDown zips a GitHub file, folder, or repository from the tab you are on.

Open a github.com file or directory, click the toolbar icon, and download a zip named after that folder. Right-click any github.com link (on GitHub or elsewhere) and choose Download with GitDown.

Whole repositories use GitHub’s own archive zip. Files and subfolders are fetched from the GitHub API and zipped in the extension — there is no TheGitDown server.

Unauthenticated GitHub API calls are rate-limited. An optional personal access token on the Options page is stored only in this browser (chrome.storage.local) and is sent only to GitHub. It does not sync with gitdown.xyz.

Privacy: https://gitdown.xyz/privacy.html
Website: https://gitdown.xyz
```

### Graphic assets

| Asset | File | Size |
| --- | --- | --- |
| Store icon | `packages/extension/public/icon-128.png` | 128×128 |
| Screenshot 1 | `packages/extension/store/screenshot-1280x800.png` | 1280×800 |
| Screenshot 2 | `packages/extension/store/screenshot-menu-1280x800.png` | 1280×800 |
| Small promo tile | `packages/extension/store/tile-440x280.png` | 440×280 |
| Marquee promo tile | `packages/extension/store/marquee-1400x560.png` | 1400×560 |

YouTube video is optional — skip for v1.

### Privacy practices (paste into the Privacy tab)

**Single purpose:** Download a GitHub file, folder, or repository as a zip.

**Remote code:** None. Fonts and scripts are bundled in the extension package.

**User data:** Optional GitHub personal access token, stored in `chrome.storage.local`, used only to authenticate requests to GitHub. Not sold. Not used for ads. Not transferred to a TheGitDown server (there isn’t one).

**Hosts:**

- `https://api.github.com/*` — Contents and repo metadata
- `https://raw.githubusercontent.com/*` — file blobs
- `https://github.com/*` and `https://www.github.com/*` — repository archive zips

**Permission justifications:**

- `storage` — save the optional GitHub token
- `downloads` — save the zip to the user’s Downloads folder
- `contextMenus` — “Download with GitDown” on GitHub pages and github.com links
- `activeTab` — read the current tab URL to detect a GitHub path
- `offscreen` — create a blob URL so Chrome saves the zip as `{folder}.zip`

**Privacy policy URL:** https://gitdown.xyz/privacy.html

### Test instructions (for the reviewer)

1. Open https://github.com/taylorsegell/TheGitDown/tree/master/images
2. Click the GitDown toolbar icon.
3. Click **Download images.zip**.
4. Confirm a zip named `images.zip` appears in Downloads.
5. Token is optional. A PAT is not required for this public folder.
6. Options page: chrome://extensions → GitDown → Details → Extension options. Token stays in this browser; privacy policy link opens https://gitdown.xyz/privacy.html

### Distribution

Trusted testers first, then public. Content rating: Everyone. Not a paid item.

## Firefox AMO

- Extension ID: `gitdown@gitdown.xyz` (already in the manifest)
- Data collection: `none`
- Same listing copy, screenshots, and privacy URL
- Upload `npm run ext:zip:firefox` output
- Also upload source: this repository minus `node_modules`, `.output`, `.wxt`, and `dist` (WXT minifies; AMO will ask for source)
- Version must match Chrome (`1.0.0`)

## Build commands

```bash
npm test
npm test -w gitdown
npm run ext:zip
npm run ext:zip:firefox
```
