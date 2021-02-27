import i18n from 'i18n'
import 'shared/assets/iconfont'
import 'shared/global.less'
import store from 'store'
import Vue from 'vue'
import App from './App.vue'

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  i18n,
  store,
  render: h => h(App),
})
