import 'assets/iconfont'
import en from 'locales/en.json5'
import zh from 'locales/zh.json5'
import moment from 'moment'
import 'moment-duration-format'
import HintPlugin from 'plugins/hint'
import ToastPlugin from 'plugins/toast'
import store from 'store'
import Vue from 'vue'
import Fragment from 'vue-fragment'
import VueI18n from 'vue-i18n'
import Vuex from 'vuex'
import browser from 'webextension-polyfill'
import App from './App.vue'
import './global.less'

const locale = browser.i18n.getUILanguage()
moment.locale(locale)

Vue.use(Fragment.Plugin)
Vue.use(HintPlugin)
Vue.use(ToastPlugin)
Vue.use(Vuex)
Vue.use(VueI18n)

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  i18n: new VueI18n({
    locale,
    fallbackLocale: 'en',
    messages: { en, zh },
  }),
  store: new Vuex.Store(store),
  render: h => h(App),
})
