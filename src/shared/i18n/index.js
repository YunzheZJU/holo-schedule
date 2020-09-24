import dayjs from 'dayjs'
import 'dayjs/locale/ja'
import 'dayjs/locale/zh-cn'
import { LOCALE } from 'shared/store/keys'
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import browser from 'webextension-polyfill'

export default (store, messages) => {
  const locale = browser.extension.getBackgroundPage().workflows.getLocale()

  Vue.use(VueI18n)
  const i18n = new VueI18n({
    locale,
    fallbackLocale: 'en',
    silentFallbackWarn: true,
    messages,
  })

  dayjs.locale(locale.toLowerCase())

  store.subscribe(({ type, payload: $locale }) => {
    if (type === LOCALE) {
      i18n.locale = $locale
      dayjs.locale($locale.toLowerCase())
    }
  })

  return i18n
}
