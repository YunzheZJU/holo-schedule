import { getUnixAfterDays, getUnixBeforeDays, getUnix } from './index'

const unixTime = Math.floor(Date.now() / 1000)

test('should get current unix time', () => {
  Date.now = jest.fn(() => unixTime * 1000)
  expect(getUnix()).toBe(unixTime)
})

test('should get unix time after days', () => {
  Date.now = jest.fn(() => unixTime * 1000)
  expect(getUnixAfterDays(7)).toBe(unixTime + 7 * 24 * 60 * 60)
  expect(getUnixAfterDays(0)).toBe(unixTime)
  expect(getUnixAfterDays(-1)).toBe(unixTime - 24 * 60 * 60)
})

test('should get unix time before days', () => {
  Date.now = jest.fn(() => unixTime * 1000)
  expect(getUnixBeforeDays(3)).toBe(unixTime - 3 * 24 * 60 * 60)
  expect(getUnixBeforeDays(0)).toBe(unixTime)
  expect(getUnixBeforeDays(-1)).toBe(unixTime + 24 * 60 * 60)
})
