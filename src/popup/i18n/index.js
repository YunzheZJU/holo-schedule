import createI18n from 'shared/i18n'
import store from 'store'
import de from './locales/de.json5'
import en from './locales/en.json5'
import es from './locales/es.json5'
import fr from './locales/fr.json5'
import id from './locales/id.json5'
import it from './locales/it.json5'
import ja from './locales/ja.json5'
import ko from './locales/ko.json5'
import pl from './locales/pl.json5'
import ptPT from './locales/pt-PT.json5'
import ptBR from './locales/pt-BR.json5'
import ru from './locales/ru.json5'
import sv from './locales/sv.json5'
import th from './locales/th.json5'
import vi from './locales/vi.json5'
import zhCN from './locales/zh-CN.json5'
import zhTW from './locales/zh-TW.json5'

const i18n = createI18n(
  store,
  { de, en, es, fr, id, it, ja, ko, pl, 'pt-PT': ptPT, 'pt-BR': ptBR, ru, sv, th, vi, 'zh-CN': zhCN, 'zh-TW': zhTW },
)

export default i18n
