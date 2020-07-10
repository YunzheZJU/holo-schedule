import { liveTypeValidator } from './index'

test('should pass', async () => {
  expect(liveTypeValidator('ended')).toBeTruthy()
  expect(liveTypeValidator('current')).toBeTruthy()
  expect(liveTypeValidator('scheduled')).toBeTruthy()
})

test('should fail', async () => {
  expect(liveTypeValidator('invalid')).toBeFalsy()
})
