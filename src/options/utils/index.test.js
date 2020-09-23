import { parseHexColor, getContrastColor } from './index'

test('should parse hex color', () => {
  expect(parseHexColor('#ffffff')).toEqual([255, 255, 255])
  expect(parseHexColor('#123456')).toEqual([18, 52, 86])
  expect(parseHexColor('#000000')).toEqual([0, 0, 0])
})

test('should get contrast color', () => {
  expect(getContrastColor('#ffffff')).toEqual('#444444')
  expect(getContrastColor('#123456')).toEqual('#ffffff')
  expect(getContrastColor('#000000')).toEqual('#ffffff')
})
