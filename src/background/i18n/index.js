import { get } from 'lodash'
import browser from 'shared/browser'
import { LOCALE } from 'shared/store/keys'
import workflows from 'workflows/workflows'
import de from './locales/de.json5'
import en from './locales/en.json5'
import es from './locales/es.json5'
import fr from './locales/fr.json5'
import id from './locales/id.json5'
import it from './locales/it.json5'
import ja from './locales/ja.json5'
import ko from './locales/ko.json5'
import pl from './locales/pl.json5'
import pt from './locales/pt.json5'
import ptBR from './locales/pt-BR.json5'
import ru from './locales/ru.json5'
import sv from './locales/sv.json5'
import th from './locales/th.json5'
import vi from './locales/vi.json5'
import zhCN from './locales/zh-CN.json5'
import zhTW from './locales/zh-TW.json5'

const messages = { de, en, es, fr, id, it, ja, ko, pl, pt, 'pt-BR': ptBR, ru, sv, th, vi, 'zh-CN': zhCN, 'zh-TW': zhTW }
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

    await store.set({ [LOCALE]: this.locale })

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
