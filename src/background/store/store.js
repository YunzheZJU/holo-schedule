import { cloneDeep, noop } from 'lodash'
import { SHOULD_SYNC_SETTINGS } from 'shared/store/keys'
import browser from 'webextension-polyfill'
import listen from '../ports/listen'

const { storage } = browser

const getStorage = async storageArea => {
  const { store = {} } = await storage[storageArea].get('store')
  return store
}

const createStore = () => {
  const data = {}
  const dataToSync = {}

  const callbacks = []
  const ports = []

  const uploadToSync = async () => {
    if (data[SHOULD_SYNC_SETTINGS]) {
      await storage.sync.set({ store: dataToSync })
    }
  }

  const set = async (obj, toStorage = { local: false, sync: false }) => {
    Object.entries(obj).forEach(([key, value]) => {
      console.log(`[store]${key} has been stored/updated successfully.`)

      const oldValue = data[key]
      data[key] = value

      callbacks.forEach(callback => callback(key, value, oldValue))

      ports.forEach(port => {
        port.postMessage({ key, value })
      })
    })
    if (toStorage.local) {
      await storage.local.set({
        store: { ...await getStorage('local'), ...obj },
      })
    }
    if (toStorage.sync) {
      Object.assign(dataToSync, obj)

      await uploadToSync()
    }
  }

  const downloadFromSync = async () => {
    Object.assign(dataToSync, await getStorage('sync'))
    if (data[SHOULD_SYNC_SETTINGS]) {
      await set(dataToSync)
    }
  }

  return {
    data,
    dataToSync,
    callbacks,
    ports,
    downloadFromSync,
    uploadToSync,
    set,
    async init() {
      await set(await getStorage('local'))

      await downloadFromSync()

      this.subscribe(SHOULD_SYNC_SETTINGS, async () => {
        await uploadToSync()
      })

      listen('store', {
        onConnect: port => Object.entries(data).forEach(([key, value]) => {
          port.postMessage({ key, value })
        }),
      })
    },
    get(key) {
      return cloneDeep(data[key])
    },
    subscribe(key = '', callback = noop) {
      callbacks.push(($key, ...args) => {
        if (key === $key) {
          callback(...args)
        }
      })
    },
  }
}

export default createStore
