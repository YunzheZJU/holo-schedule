import { getUnixAfterDays, getUnixBeforeDays, getUnix } from './index'

const mockedUnixTime = Math.floor(Date.now() / 1000)

test('should get current unix time', () => {
  Date.now = jest.fn(() => mockedUnixTime * 1000)
  expect(getUnix()).toBe(mockedUnixTime)
})

test('should get unix time after days', () => {
  Date.now = jest.fn(() => mockedUnixTime * 1000)
  expect(getUnixAfterDays(7)).toBe(mockedUnixTime + 7 * 24 * 60 * 60)
  expect(getUnixAfterDays(0)).toBe(mockedUnixTime)
  expect(getUnixAfterDays(-1)).toBe(mockedUnixTime - 24 * 60 * 60)
})

test('should get unix time before days', () => {
  Date.now = jest.fn(() => mockedUnixTime * 1000)
  expect(getUnixBeforeDays(3)).toBe(mockedUnixTime - 3 * 24 * 60 * 60)
  expect(getUnixBeforeDays(0)).toBe(mockedUnixTime)
  expect(getUnixBeforeDays(-1)).toBe(mockedUnixTime + 24 * 60 * 60)
})
