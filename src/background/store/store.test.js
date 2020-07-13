import createStore from './store'

test('should init', async () => {
  const storage = {
    get: jest.fn(() => ({ store: { key: 'saved value' } })),
    set: jest.fn(),
  }
  const store = createStore(storage)
  await store.init()

  expect(store.get('key')).toEqual('saved value')
})

test('should set and get value', async () => {
  const storage = {
    get: jest.fn(),
    set: jest.fn(),
  }
  const store = createStore(storage)

  await store.set({ a: 'string', b: 1, c: { name: 'object' } })
  expect(store.get('a')).toEqual('string')
  expect(store.get('b')).toEqual(1)
  expect(store.get('c')).toEqual({ name: 'object' })
})

test('should use storage', async () => {
  const storage = {
    get: jest.fn(() => ({})),
    set: jest.fn(),
  }
  const store = createStore(storage)

  await store.set({ a: 'string', b: 1, c: { name: 'object' } }, true)
  expect(storage.set.mock.calls.length).toEqual(1)
  await store.set({ d: 'other value' })
  expect(storage.set.mock.calls.length).toEqual(1)
})

test('should subscribe live', async () => {
  const storage = {
    get: jest.fn(),
    set: jest.fn(),
  }
  const store = createStore(storage)

  const callbackFn = jest.fn()
  store.subscribe('lives', callbackFn)

  await store.set({ lives: [{ id: 1 }] })
  await store.set({ lives: [{ id: 2 }, { id: 3 }] })

  expect(callbackFn.mock.calls.length).toEqual(2)
  expect(callbackFn.mock.calls[0][0]).toEqual([{ id: 1 }])
  expect(callbackFn.mock.calls[0][1]).toEqual(undefined)
  expect(callbackFn.mock.calls[1][0]).toEqual([{ id: 2 }, { id: 3 }])
  expect(callbackFn.mock.calls[1][1]).toEqual([{ id: 1 }])
})
