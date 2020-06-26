import { createEnhancedArray } from '../lib/enhancedArray'

const hints = createEnhancedArray([
  // { id: 999, text: 'Default hint' },
])

const HintPlugin = {
  install(Vue) {
    Vue.prototype.$hints = hints
  },
}

export default HintPlugin