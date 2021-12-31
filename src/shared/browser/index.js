import browser from 'webextension-polyfill'

browser.action = browser.action ?? browser.browserAction
browser.i18n.getUILanguage = browser.i18n.getUILanguage ?? (() => navigator?.language)

export default browser
