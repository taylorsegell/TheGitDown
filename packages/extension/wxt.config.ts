import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  // Firefox defaults to MV2; force MV3 so `wxt build -b firefox` emits firefox-mv3.
  manifestVersion: 3,
  manifest: ({ browser }) => ({
    name: 'GitDown',
    description:
      'Download a GitHub file or folder as a zip from the current tab.',
    icons: {
      16: '/icon-16.png',
      32: '/icon-32.png',
      48: '/icon-48.png',
      96: '/icon-96.png',
      128: '/icon-128.png',
    },
    action: {
      default_icon: {
        16: '/icon-16.png',
        32: '/icon-32.png',
        48: '/icon-48.png',
        96: '/icon-96.png',
        128: '/icon-128.png',
      },
    },
    permissions: [
      'storage',
      'downloads',
      'contextMenus',
      'activeTab',
      ...(browser === 'firefox' ? [] : ['offscreen']),
    ],
    homepage_url: 'https://gitdown.xyz',
    host_permissions: [
      'https://api.github.com/*',
      'https://raw.githubusercontent.com/*',
      'https://github.com/*',
      'https://www.github.com/*',
    ],
    browser_specific_settings: {
      gecko: {
        id: 'gitdown@gitdown.xyz',
        data_collection_permissions: {
          required: ['none'],
        },
      },
    },
  }),
});
