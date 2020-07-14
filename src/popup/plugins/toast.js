import { createEnhancedArray } from 'shared/lib/enhancedArray'

const toasts = createEnhancedArray()

// toasts.add({ id: 999, type: 'error', text: 'Default error toast' })
// toasts.add({ id: 1000, type: 'error', text: 'Default error toast 2 Default error toast 2' })
// toasts.add({ id: 1001, type: 'info', text: 'Default info toast' })

const toastPlugin = {
  install(Vue) {
    // eslint-disable-next-line no-param-reassign
    Vue.prototype.$toasts = toasts
  },
}

export default toastPlugin
