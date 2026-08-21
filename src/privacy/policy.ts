export const PRIVACY_UPDATED = '20 August 2026'
export const PRIVACY_CANONICAL_URL = 'https://gitdown.xyz/privacy.html'

export type PrivacyBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }

export type PrivacySection = {
  id: string
  title: string
  blocks: PrivacyBlock[]
}

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    id: 'summary',
    title: 'The short version',
    blocks: [
      {
        type: 'p',
        text: 'TheGitDown is a client-side tool. The website (gitdown.xyz) and the GitDown browser extension talk to GitHub from your browser. There is no TheGitDown backend, and we do not operate a server that receives your GitHub token or the files you download. The zip stays on your machine.',
      },
    ],
  },
  {
    id: 'what-we-do-not-collect',
    title: 'What we do not collect',
    blocks: [
      {
        type: 'ul',
        items: [
          'No analytics, ads, or telemetry.',
          'No accounts. No email required.',
          'We do not sell, rent, or share personal information with third parties.',
          'We do not get a copy of the zip you download.',
        ],
      },
    ],
  },
  {
    id: 'website',
    title: 'Website (gitdown.xyz)',
    blocks: [
      {
        type: 'p',
        text: 'If you paste an optional GitHub personal access token, it lives only in this browser\'s localStorage. It is sent only to GitHub (api.github.com and raw.githubusercontent.com) to raise API rate limits. Clear site data or use the token UI and it is gone.',
      },
      {
        type: 'p',
        text: 'Shareable links are ordinary page URLs with the GitHub path in the hash (for example #/home?url=…). Anyone who opens that link can start the same client-side download. TheGitDown does not log those links.',
      },
    ],
  },
  {
    id: 'extension',
    title: 'Browser extension',
    blocks: [
      {
        type: 'p',
        text: 'If you save an optional GitHub personal access token on the Options page, it lives only in this browser\'s chrome.storage.local (or the Firefox equivalent). The service worker reads it to talk to GitHub. It is not synced with gitdown.xyz localStorage, and it is never sent to a TheGitDown server.',
      },
      {
        type: 'p',
        text: 'The extension reads the current tab URL or a right-clicked github.com link only to detect a public GitHub file, folder, or repository. It downloads file contents from GitHub, zips them in the extension, and saves the zip through the browser downloads API onto your computer.',
      },
      {
        type: 'ul',
        items: [
          'Hosts contacted: api.github.com, raw.githubusercontent.com, and github.com (repository archive zips).',
          'Permissions used: storage (optional token), downloads (save the zip), contextMenus, activeTab, and offscreen (Chrome: create a blob URL so the zip is named after the folder).',
        ],
      },
    ],
  },
  {
    id: 'github',
    title: 'GitHub',
    blocks: [
      {
        type: 'p',
        text: 'GitHub\'s own privacy policy applies to requests your browser makes to GitHub. Unauthenticated use is rate-limited by GitHub. A token you supply is a credential for GitHub, not for TheGitDown.',
      },
    ],
  },
  {
    id: 'children',
    title: 'Children',
    blocks: [
      {
        type: 'p',
        text: 'TheGitDown is not directed at children under 13, and we do not knowingly collect personal information from children.',
      },
    ],
  },
  {
    id: 'changes',
    title: 'Changes',
    blocks: [
      {
        type: 'p',
        text: 'If this policy changes, we will update this page and the date below. Keep using the website or extension after an update and you accept the revised policy.',
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    blocks: [
      {
        type: 'p',
        text: 'Questions: open an issue on github.com/taylorsegell/TheGitDown, or find Taylor Segell at github.com/taylorsegell.',
      },
    ],
  },
]
