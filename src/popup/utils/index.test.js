import { sleep } from './index'

test('should sleep', async () => {
  await sleep(1000)
  expect(true).toBeTruthy()
})
