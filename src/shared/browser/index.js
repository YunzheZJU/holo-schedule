import browser from 'webextension-polyfill'

browser.action = browser.action ?? browser.browserAction
browser.i18n.getUILanguage = browser.i18n.getUILanguage ?? (() => navigator?.language)
// eslint-disable-next-line no-undef
browser.isChrome = IS_CHROME

export default browser
