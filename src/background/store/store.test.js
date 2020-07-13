import browser from 'webextension-polyfill'
import createStore from './store'

const storage = browser.storage.local

test('should init', async () => {
  await createStore().init()

  expect(storage.get).toHaveBeenCalledTimes(1)
})

test('should set and get value', async () => {
  const store = await createStore()

  await store.set({ a: 'string', b: 1, c: { name: 'object' } })
  expect(store.get('a')).toEqual('string')
  expect(store.get('b')).toEqual(1)
  expect(store.get('c')).toEqual({ name: 'object' })
})

test('should use storage', async () => {
  const store = await createStore()

  await store.set({ a: 'string', b: 1, c: { name: 'object' } }, true)
  expect(storage.set).toHaveBeenCalledTimes(1)
  await store.set({ d: 'other value' })
  expect(storage.set).toHaveBeenCalledTimes(1)
})

test('should subscribe live', async () => {
  const store = await createStore()

  const callbackFn = jest.fn()
  store.subscribe('lives', callbackFn)

  await store.set({ lives: [{ id: 1 }] })
  await store.set({ lives: [{ id: 2 }, { id: 3 }] })

  expect(callbackFn).toHaveBeenCalledTimes(2)
  expect(callbackFn).toHaveBeenNthCalledWith(1, [{ id: 1 }], undefined)
  expect(callbackFn).toHaveBeenNthCalledWith(2, [{ id: 2 }, { id: 3 }], [{ id: 1 }])
})
