import i18n from 'i18n'
import HintPlugin from 'plugins/hint'
import ToastPlugin from 'plugins/toast'
import 'shared/assets/iconfont'
import 'shared/global.less'
import { APPEARANCE } from 'shared/store/keys'
import workflows from 'shared/workflows'
import store from 'store'
import { createApp } from 'vue'
import Fragment from 'vue-fragment'
import App from './App.vue'
import './global.less'

const app = createApp(App)

app.use(store)
app.use(i18n)
app.use(Fragment.Plugin)
app.use(HintPlugin)
app.use(ToastPlugin)

app.mount('#app')

workflows.downloadSettings()

document.documentElement.dataset.theme = getComputedStyle(document.documentElement).getPropertyValue('--prefers-color-scheme').trim()
store.subscribe(({ type, payload }) => {
  if (type === APPEARANCE) {
    document.documentElement.dataset.theme = payload
  }
})
