import { getUniqueId } from '../utils'

const createEnhancedArray = (defaultValue = []) => {
  const enhancedArray = defaultValue

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

  enhancedArray.add = (item = {
    text: '',
  }) => {
    const id = getUniqueId()
    enhancedArray.push({ id, ...item })
    return id
  }

  // Changes made by lodash#remove would not traced by Vue
  enhancedArray.remove = (itemId) => {
    const index = enhancedArray.findIndex(({ id }) => id === itemId)

    if (index === -1) return

    enhancedArray.splice(index, 1)
  }

  return enhancedArray
}

export {
  createEnhancedArray,
}