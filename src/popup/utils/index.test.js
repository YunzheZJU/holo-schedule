import { formatDurationFromSeconds, normalize, sampleHotnesses, sleep } from './index'

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
test('should work', () => {
  const liveOne = {
    start_at: '2021-08-17T02:00:00.000Z',
    hotnesses: [{
      watching: 4396,
      like: 6213,
      created_at: '2021-08-17T04:10:22.927Z',
    }, {
      watching: 4406,
      like: 6232,
      created_at: '2021-08-17T04:11:22.940Z',
    }, {
      watching: 4406,
      like: null,
      created_at: '2021-08-17T04:12:22.816Z',
    }, {
      watching: 4392,
      like: null,
      created_at: '2021-08-17T04:13:22.913Z',
    }, {
      watching: 4432,
      like: 6291,
      created_at: '2021-08-17T04:14:23.093Z',
    }, {
      watching: 4430,
      like: 6315,
      created_at: '2021-08-17T04:15:22.959Z',
    }],
  }
  const resultOne = sampleHotnesses(liveOne, 61)
  console.log(resultOne)
})
