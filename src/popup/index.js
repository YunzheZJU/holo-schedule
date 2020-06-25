import Vue from 'vue'
import App from './App.vue'
import './global.less'
import HintPlugin from './plugins/hint'
import ToastPlugin from './plugins/toast'

Vue.use(HintPlugin)
Vue.use(ToastPlugin)

new Vue({
  el: '#app',
  render: h => h(App),
})
