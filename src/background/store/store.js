import { cloneDeep, pull } from 'lodash'
import { SHOULD_SYNC_SETTINGS } from 'shared/store/keys'
import browser from 'webextension-polyfill'

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

  const onConnect = port => {
    if (port.name !== 'store') return

    ports.push(port)

    // Set default values
    Object.entries(data).map(
      ([key, value]) => port.postMessage({ key, value }),
    )

    port.onDisconnect.addListener(() => pull(ports, port))
  }

  return {
    data,
    dataToSync,
    callbacks,
    ports,
    async init() {
      await this.set(await getStorage('local'))

      Object.assign(dataToSync, await getStorage('sync'))
      if (data[SHOULD_SYNC_SETTINGS]) {
        await this.set(dataToSync)
      }

      browser.runtime.onConnect.addListener(onConnect)
    },
    get(key) {
      return cloneDeep(data[key])
    },
    async set(obj, toStorage = { local: false, sync: false }) {
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
        console.log('add to syncData', obj)
        Object.assign(dataToSync, obj)
      }
      if (data[SHOULD_SYNC_SETTINGS]) {
        console.log('sync settings', dataToSync)
        await storage.sync.set({ store: dataToSync })
      }
    },
    subscribe(key = '', callback = () => null) {
      callbacks.push(($key, ...args) => {
        if (key === $key) {
          callback(...args)
        }
      })
    },
  }
}

export default createStore
