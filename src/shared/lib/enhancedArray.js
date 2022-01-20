import { uniqueId } from 'lodash'
import { reactive } from 'vue'

const createEnhancedArray = (target, limit = Infinity) => {
  const enhancedArray = reactive(target ?? [])

  Object.defineProperty(enhancedArray, 'any', {
    get() {
      return enhancedArray.length > 0
    },
  })

  Object.defineProperty(enhancedArray, 'last', {
    get() {
      return enhancedArray[enhancedArray.length - 1]
    },
  })

  enhancedArray.add = (item = {}) => {
    const indexedItem = { $id: uniqueId(), ...item }
    enhancedArray.push(indexedItem)

    if (enhancedArray.length > limit) {
      enhancedArray.shift()
    }

    return indexedItem
  }

  // Changes made by lodash#remove would not traced by Vue
  enhancedArray.remove = item => {
    const index = enhancedArray.indexOf(item)

    if (index === -1) return

    enhancedArray.splice(index, 1)
  }

  return enhancedArray
}

// eslint-disable-next-line import/prefer-default-export
export { createEnhancedArray }
