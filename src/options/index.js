import i18n from 'i18n'
import 'shared/assets/iconfont'
import 'shared/global.less'
import store from 'store'
import { createApp, h } from 'vue'
import Fragment from 'vue-fragment'
import App from './App.vue'

const app = createApp(App)

app.use(store)
app.use(i18n)
app.use(Fragment.Plugin, { h })

app.mount('#app')
