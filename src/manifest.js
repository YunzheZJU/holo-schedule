const PACKAGE = require('../package.json')

module.exports = {
  manifest_version: 2,
  name: PACKAGE.name,
  version: PACKAGE.version,
  description: PACKAGE.description,
  homepage_url: PACKAGE.repository,
  author: PACKAGE.author,
  icons: {
    16: 'icons/icon@16.png',
    32: 'icons/icon@32.png',
    48: 'icons/icon@48.png',
    96: 'icons/icon@96.png',
    128: 'icons/icon@128.png',
  },
  permissions: [
    'alarms',
    'notifications',
    'storage',
  ],
  background: {
    scripts: [
      'src/background.js',
    ],
  },
  browser_action: {
    browser_style: true,
    default_title: 'Keep in touch with Hololive',
    default_icon: {
      16: 'icons/icon@16.png',
      32: 'icons/icon@32.png',
    },
    default_popup: 'src/popup.html',
  },
  web_accessible_resources: [
    'assets/*',
  ],
  browser_specific_settings: {
    gecko: {
      id: 'holo-schedule@holo.dev',
      strict_min_version: '57.0',
    },
  },
  minimum_chrome_version: '57.0',
}
