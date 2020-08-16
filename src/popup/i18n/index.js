import moment from 'moment'
import { LOCALE } from 'shared/store/keys'
import store from 'store'
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import browser from 'webextension-polyfill'
import en from './locales/en.json5'
import ja from './locales/ja.json5'
import zhCN from './locales/zh-CN.json5'

const locale = browser.extension.getBackgroundPage().workflows.getLocale()

Vue.use(VueI18n)
const i18n = new VueI18n({
  locale,
  fallbackLocale: 'en',
  silentFallbackWarn: true,
  messages: { en, ja, 'zh-CN': zhCN },
})

moment.locale(locale)

store.subscribe(({ type, payload: $locale }) => {
  if (type === LOCALE) {
    i18n.locale = $locale
    moment.locale($locale)
  }
})

export default i18n
