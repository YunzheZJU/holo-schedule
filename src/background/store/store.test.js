import browser from 'shared/browser'
import { SHOULD_SYNC_SETTINGS } from 'shared/store/keys'
import createStore from './store'

const localStorage = browser.storage.local
const syncStorage = browser.storage.sync

test('should init', async () => {
  await createStore().init()

  expect(localStorage.get).toHaveBeenCalledTimes(1)
  expect(syncStorage.get).toHaveBeenCalledTimes(1)
})

test('should set and get value', async () => {
  const store = createStore()

  await store.set({ a: 'string', b: 1, c: { name: 'object' } }, { local: false })
  expect(store.get('a')).toEqual('string')
  expect(store.get('b')).toEqual(1)
  expect(store.get('c')).toEqual({ name: 'object' })
})

test('should use storage', async () => {
  const store = createStore()

  await store.set({ d: 'other value' }, { local: false })
  expect(localStorage.set).toHaveBeenCalledTimes(0)
  expect(syncStorage.set).toHaveBeenCalledTimes(0)
  await store.set({ a: 'string', b: 1, c: { name: 'object' } })
  expect(localStorage.set).toHaveBeenCalledTimes(1)
  expect(syncStorage.set).toHaveBeenCalledTimes(0)
  await store.set({ a: 'string', b: 1, c: { name: 'object' } }, { sync: true })
  expect(localStorage.set).toHaveBeenCalledTimes(2)
  expect(syncStorage.set).toHaveBeenCalledTimes(0)
  await store.set(
    { a: 'string', b: 1, c: { name: 'object' }, [SHOULD_SYNC_SETTINGS]: true },
    { sync: true },
  )
  expect(localStorage.set).toHaveBeenCalledTimes(3)
  expect(syncStorage.set).toHaveBeenCalledTimes(1)
})

test('should subscribe live', async () => {
  const store = createStore()

  const callbackFn = jest.fn()
  store.subscribe('lives', callbackFn)

  await store.set({ lives: [{ id: 1 }] })
  await store.set({ lives: [{ id: 2 }, { id: 3 }] })

  expect(callbackFn).toHaveBeenCalledTimes(2)
  expect(callbackFn).toHaveBeenNthCalledWith(1, [{ id: 1 }], undefined)
  expect(callbackFn).toHaveBeenNthCalledWith(2, [{ id: 2 }, { id: 3 }], [{ id: 1 }])
})
