import { formatDurationFromSeconds, sleep } from './index'

test('should sleep', async () => {
  await sleep(1000)
  expect(true).toBeTruthy()
})

test('should format duration from seconds', async () => {
  expect(formatDurationFromSeconds()).toEqual('0:00')
  expect(formatDurationFromSeconds(1)).toEqual('0:01')
  expect(formatDurationFromSeconds(59)).toEqual('0:59')
  expect(formatDurationFromSeconds(60)).toEqual('1:00')
  expect(formatDurationFromSeconds(601)).toEqual('10:01')
  expect(formatDurationFromSeconds(3600)).toEqual('1:00:00')
  expect(formatDurationFromSeconds(3601)).toEqual('1:00:01')
  expect(formatDurationFromSeconds(3600 * 24 + 1)).toEqual('24:00:01')
})
