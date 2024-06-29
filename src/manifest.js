module.exports = ({ isChrome, PACKAGE = {} } = {}) => ({
  manifest_version: isChrome ? 3 : 2,
  name: '__MSG_extensionName__',
  description: '__MSG_extensionDescription__',
  version: PACKAGE.version,
  homepage_url: PACKAGE.repository,
  author: PACKAGE.author,
  default_locale: 'en',
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
    ...(isChrome ? {
      service_worker: 'src/background.js',
    } : {
      page: 'src/background.html',
    }),
  },
  [isChrome ? 'action' : 'browser_action']: {
    [isChrome ? 'chrome_style' : 'browser_style']: false,
    default_title: '__MSG_browserActionTitle__',
    default_icon: {
      16: 'icons/icon@16.png',
      32: 'icons/icon@32.png',
    },
    default_popup: 'src/popup.html',
  },
  options_ui: {
    page: 'src/options.html',
    open_in_tab: true,
    ...(isChrome ? {} : {
      browser_style: false,
    }),
  },
  ...(isChrome ? {
    minimum_chrome_version: '88.0',
  } : {
    browser_specific_settings: {
      gecko: {
        id: 'holo-schedule@holo.dev',
        strict_min_version: '58.0',
      },
    },
  }),
})
