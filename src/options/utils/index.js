import { range } from 'lodash'

const parseHexColor = hexString => {
  const match = hexString.match(/^#([0-9a-f]{6})$/i)[1]

  if (!match) {
    return [255, 255, 255]
  }

  return range(0, 3).map(
    index => parseInt(match.substr(index * 2, 2), 16),
  )
}

const getContrastColor = hexString => {
  const [r, g, b] = parseHexColor(hexString)
  const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b

  if (gray < 188) {
    return '#ffffff'
  }

  return '#444444'
}

export { parseHexColor, getContrastColor }
