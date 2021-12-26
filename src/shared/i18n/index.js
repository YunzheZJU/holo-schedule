import dayjs from 'dayjs'
import 'dayjs/locale/de'
import 'dayjs/locale/ja'
import 'dayjs/locale/zh-cn'
import { LOCALE } from 'shared/store/keys'
import { createI18n } from 'vue-i18n'
import browser from 'webextension-polyfill'

export default (store, messages) => {
  const locale = browser.extension.getBackgroundPage().workflows.getLocale()

  const i18n = createI18n({
    locale,
    fallbackLocale: 'en',
    silentFallbackWarn: true,
    messages,
  })

  dayjs.locale(locale.toLowerCase())

  store.subscribe(({ type, payload: $locale }) => {
    if (type === LOCALE) {
      i18n.global.locale = $locale
      dayjs.locale($locale.toLowerCase())
    }
  })

  return i18n
}
