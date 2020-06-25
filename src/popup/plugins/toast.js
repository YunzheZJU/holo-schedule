import { getUniqueId } from '../utils'

const toasts = [
  // { id: 999, type: 'error', text: 'Default error toast' },
  // { id: 1000, type: 'error', text: 'Default error toast 2 Default error toast 2' },
  // { id: 1001, type: 'info', text: 'Default info toast' },
]

toasts.add = (toast = {
  type: '',
  text: '',
}) => {
  const id = getUniqueId()
  toasts.push({ id, ...toast })
  return id
}

toasts.remove = (toastId) => {
  const index = toasts.findIndex(({ id }) => id === toastId)

  if (index === -1) return

  toasts.splice(index, 1)
}

const toastPlugin = {
  install(Vue) {
    Vue.prototype.$toasts = toasts
  },
}

export default toastPlugin