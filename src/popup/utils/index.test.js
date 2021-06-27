import { formatDurationFromSeconds, normalize, sleep } from './index'

test('should sleep', async () => {
  await sleep(1000)
  expect(true).toBeTruthy()
})

test('should format duration from seconds', () => {
  expect(formatDurationFromSeconds()).toEqual('0:00')
  expect(formatDurationFromSeconds(1)).toEqual('0:01')
  expect(formatDurationFromSeconds(59)).toEqual('0:59')
  expect(formatDurationFromSeconds(60)).toEqual('1:00')
  expect(formatDurationFromSeconds(601)).toEqual('10:01')
  expect(formatDurationFromSeconds(3600)).toEqual('1:00:00')
  expect(formatDurationFromSeconds(3601)).toEqual('1:00:01')
  expect(formatDurationFromSeconds(3600 * 24 + 1)).toEqual('24:00:01')
})

test('should normalize', () => {
  expect(normalize([{ a: 1 }, { a: 2 }, { a: 3 }], 'a')).toEqual([{ a: 0 }, { a: 0.5 }, { a: 1 }])
  expect(normalize([{ a: 1 }, { a: 2 }, { a: 3 }, { a: null }], 'a')).toEqual([{ a: 0 }, { a: 0.5 }, { a: 1 }, { a: 0 }])
  // Not enough valid values: at least two positive numbers
  expect(normalize([{ a: 0 }, { a: 2 }, { a: null }], 'a')).toEqual([{ a: 1 }, { a: 1 }, { a: 1 }])
  expect(normalize([{ a: null }], 'a')).toEqual([{ a: 1 }])
  expect(normalize([{ a: 1 }, { a: null }], 'a')).toEqual([{ a: 1 }, { a: 1 }])
  expect(normalize([{ a: 0 }, { a: 0 }, { a: null }], 'a')).toEqual([{ a: 1 }, { a: 1 }, { a: 1 }])
})

// Tests for sampleHotnesses are not added for issues with floating number precisions
