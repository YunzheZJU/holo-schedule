import i18n from 'i18n'
import HintPlugin from 'plugins/hint'
import ToastPlugin from 'plugins/toast'
import 'shared/assets/iconfont'
import 'shared/global.less'
import { APPEARANCE } from 'shared/store/keys'
import store from 'store'
import Vue from 'vue'
import Fragment from 'vue-fragment'
import browser from 'webextension-polyfill'
import App from './App.vue'
import './global.less'

Vue.use(Fragment.Plugin)
Vue.use(HintPlugin)
Vue.use(ToastPlugin)

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  i18n,
  store,
  render: h => h(App),
})

const { workflows: { downloadSettings } } = browser.extension.getBackgroundPage()
downloadSettings()

document.documentElement.dataset.theme = getComputedStyle(document.documentElement).getPropertyValue('--prefers-color-scheme').trim()
store.subscribe(({ type, payload }) => {
  if (type === APPEARANCE) {
    document.documentElement.dataset.theme = payload
  }
})
