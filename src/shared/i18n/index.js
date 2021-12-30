import dayjs from 'dayjs'
import 'dayjs/locale/de'
import 'dayjs/locale/ja'
import 'dayjs/locale/zh-cn'
import { LOCALE } from 'shared/store/keys'
import workflows from 'shared/workflows'
import { createI18n } from 'vue-i18n'
import browser from 'webextension-polyfill'

export default (store, messages) => {
  const locale = browser.i18n.getUILanguage?.() ?? navigator.language

  const i18n = createI18n({
    locale,
    fallbackLocale: 'en',
    silentFallbackWarn: true,
    messages,
  })

  const updateLocale = $locale => {
    i18n.global.locale = $locale
    dayjs.locale($locale.toLowerCase())
  }

  updateLocale(locale)

  store.subscribe(({ type, payload }) => {
    if (type === LOCALE) {
      updateLocale(payload)
    }
  })

  workflows.getLocale().then(updateLocale)

  return i18n
}
