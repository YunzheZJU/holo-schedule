// TODO: Share code with toast.js
import { getUniqueId } from '../utils'

const hints = [
  // { id: 999, text: 'Default hint' },
]

Object.defineProperty(hints, 'any', {
  get() {
    return hints.length > 0
  },
})

hints.add = (hint = {
  text: '',
}) => {
  const id = getUniqueId()
  hints.push({ id, ...hint })
  return id
}

// Changes made by lodash#remove would not traced by Vue
hints.remove = (hintId) => {
  const index = hints.findIndex(({ id }) => id === hintId)

  if (index === -1) return

  hints.splice(index, 1)
}

const HintPlugin = {
  install(Vue) {
    Vue.prototype.$hints = hints
  },
}

export default HintPlugin