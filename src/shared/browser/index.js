import browser from 'webextension-polyfill'

browser.action = browser.action ?? browser.browserAction
browser.i18n.getUILanguage = browser.i18n.getUILanguage ?? (() => navigator?.language)
browser.isChrome = typeof InstallTrigger === 'undefined'

export default browser
