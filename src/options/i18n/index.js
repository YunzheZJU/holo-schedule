import createI18n from 'shared/i18n'
import store from 'store'
import en from './locales/en.json5'
import ja from './locales/ja.json5'
import zhCN from './locales/zh-CN.json5'

const i18n = createI18n(store, { en, ja, 'zh-CN': zhCN })

export default i18n
