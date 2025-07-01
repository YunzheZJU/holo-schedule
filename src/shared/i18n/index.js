import dayjs from 'dayjs'
import 'dayjs/locale/de'
import 'dayjs/locale/es'
import 'dayjs/locale/fr'
import 'dayjs/locale/id'
import 'dayjs/locale/it'
import 'dayjs/locale/ja'
import 'dayjs/locale/ko'
import 'dayjs/locale/pl'
import 'dayjs/locale/pt'
import 'dayjs/locale/pt-br'
import 'dayjs/locale/ru'
import 'dayjs/locale/sv'
import 'dayjs/locale/th'
import 'dayjs/locale/vi'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/zh-tw'
import browser from 'shared/browser'
import { LOCALE } from 'shared/store/keys'
import workflows from 'shared/workflows'
import { createI18n } from 'vue-i18n'

const FALLBACK_LOCALE = 'en'

export default (store, messages) => {
  const locale = browser.i18n.getUILanguage()

  const i18n = createI18n({
    locale,
    fallbackLocale: FALLBACK_LOCALE,
    silentFallbackWarn: true,
    messages,
  })

  const updateLocale = $locale => {
    i18n.global.locale = $locale
    dayjs.locale($locale?.toLowerCase?.() ?? FALLBACK_LOCALE)
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
