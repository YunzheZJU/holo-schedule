import Vue from 'vue'
import i18n from 'i18n'
import store from 'store'
import App from './App.vue'

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  i18n,
  store,
  render: h => h(App),
})
