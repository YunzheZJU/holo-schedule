import 'assets/iconfont'
import i18n from 'i18n'
import 'moment-duration-format'
import HintPlugin from 'plugins/hint'
import ToastPlugin from 'plugins/toast'
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
