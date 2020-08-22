import { get } from 'lodash'
import { LOCALE } from 'shared/store/keys'
import browser from 'webextension-polyfill'
import workflows from 'workflows'
import ja from './locales/ja.json5'
import en from './locales/en.json5'
import zhCN from './locales/zh-CN.json5'

const messages = { en, ja, 'zh-CN': zhCN }
const supportedLocales = Object.keys(messages)

const i18n = {
  messages,
  locale: supportedLocales[0],
  async init(store) {
    const localeFromBrowser = browser.i18n.getUILanguage()
    if (supportedLocales.find(locale => locale.startsWith(localeFromBrowser))) {
      this.locale = localeFromBrowser
    }

    const localeFromStore = workflows.getLocale()
    this.locale = localeFromStore ?? this.locale

    await store.set(
      { [LOCALE]: this.locale },
      { local: true, sync: true },
    )

    store.subscribe(LOCALE, locale => {
      this.locale = locale
    })
  },
  getMessage(path, msg = {}) {
    return get(this.messages[this.locale], path, '')
      .replace(/{([^}]+?)}/, (_, p1) => get(msg, p1, ''))
  },
}

export default i18n
