import withLock from './lock'

test('should exec in order', async () => {
  const obj = { count: 0 }
  const fn = jest.fn()

  await Promise.all([
    withLock(async () => {
      await new Promise(res => {
        setTimeout(res, 100)
      })
      fn(obj.count)
    }),
    withLock(async () => {
      obj.count += 1
    }),
    withLock(async () => {
      await new Promise(res => {
        setTimeout(res, 200)
      })
      obj.count += 1
    }),
    withLock(async () => {
      fn(obj.count)
    }),
  ])

  expect(fn).toHaveBeenCalledTimes(2)
  expect(fn).toHaveBeenNthCalledWith(1, 0)
  expect(fn).toHaveBeenNthCalledWith(2, 2)
})

test('should exec even if an error occurs', async () => {
  const obj = { count: 0 }
  const fn = jest.fn()
  const message = 'an error'
  let error

  await Promise.all([
    withLock(async () => {
      await new Promise(res => {
        setTimeout(res, 100)
      })
      fn(obj.count)
    }),
    withLock(async () => {
      throw new Error(message)
    }).catch(err => {
      error = err
    }),
    withLock(async () => {
      obj.count += 1
    }),
    withLock(async () => {
      await new Promise(res => {
        setTimeout(res, 200)
      })
      fn(obj.count)
    }),
  ])

  expect(error.message).toEqual(message)
  expect(fn).toHaveBeenCalledTimes(2)
  expect(fn).toHaveBeenNthCalledWith(1, 0)
  expect(fn).toHaveBeenNthCalledWith(2, 1)
})
