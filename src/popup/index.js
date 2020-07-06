import 'moment'
import 'moment-duration-format'
import HintPlugin from 'plugins/hint'
import ToastPlugin from 'plugins/toast'
import Vue from 'vue'
import Fragment from 'vue-fragment'
import App from './App.vue'
import './global.less'

Vue.use(Fragment.Plugin)
Vue.use(HintPlugin)
Vue.use(ToastPlugin)

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  render: h => h(App),
})
