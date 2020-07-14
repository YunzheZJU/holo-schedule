import 'moment'
import 'moment-duration-format'
import HintPlugin from 'plugins/hint'
import ToastPlugin from 'plugins/toast'
import store from 'store'
import Vue from 'vue'
import Fragment from 'vue-fragment'
import Vuex from 'vuex'
import App from './App.vue'
import './global.less'

Vue.use(Fragment.Plugin)
Vue.use(HintPlugin)
Vue.use(ToastPlugin)
Vue.use(Vuex)

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  store: new Vuex.Store(store),
  render: h => h(App),
})
