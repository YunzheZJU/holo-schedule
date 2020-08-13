import moment from 'moment'
import {
  getUnixAfterDays,
  getUnixBeforeDays,
  getUnix,
  isGuerrillaLive,
} from './index'

const unixTime = Math.floor(Date.now() / 1000)
Date.now = jest.fn(() => unixTime * 1000)

test('should get current unix time', () => {
  expect(getUnix()).toBe(unixTime)
})

test('should get unix time after days', () => {
  expect(getUnixAfterDays(7)).toBe(unixTime + 7 * 24 * 60 * 60)
  expect(getUnixAfterDays(0)).toBe(unixTime)
  expect(getUnixAfterDays(-1)).toBe(unixTime - 24 * 60 * 60)
})

test('should get unix time before days', () => {
  expect(getUnixBeforeDays(3)).toBe(unixTime - 3 * 24 * 60 * 60)
  expect(getUnixBeforeDays(0)).toBe(unixTime)
  expect(getUnixBeforeDays(-1)).toBe(unixTime + 24 * 60 * 60)
})

test('should be guerrila live', () => {
  const liveOne = {
    start_at: moment().add(10, 'minutes').toISOString(),
    created_at: moment().toISOString(),
  }
  const liveTwo = {
    start_at: moment().subtract(1, 'second').toISOString(),
    created_at: moment().toISOString(),
  }

  expect(isGuerrillaLive(liveOne)).toBeTruthy()
  expect(isGuerrillaLive(liveTwo)).toBeTruthy()
})

test('should not be guerrila live', () => {
  const live = {
    start_at: moment().add(10, 'minutes').add(1, 'second').toISOString(),
    created_at: moment().toISOString(),
  }

  expect(isGuerrillaLive(live)).toBeFalsy()
})
