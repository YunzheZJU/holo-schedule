import { createEnhancedArray } from 'shared/lib/enhancedArray'

const hints = createEnhancedArray()

// hints.add({ id: 999, text: 'Default hint' })

const HintPlugin = {
  install(app) {
    // eslint-disable-next-line no-param-reassign
    app.config.globalProperties.$hints = hints
  },
}

export default HintPlugin
