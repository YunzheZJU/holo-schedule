import { cloneDeep, pull } from 'lodash'
import browser from 'webextension-polyfill'

const getStorage = async storageArea => {
  const { store = {} } = await browser.storage[storageArea].get('store')
  return store
}

const createStore = () => {
  const data = {}

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
    ports,
    callbacks: [],
    async init() {
      await this.set({
        ...await getStorage('local'),
        ...await getStorage('sync'),
      })
      browser.runtime.onConnect.addListener(onConnect)
    },
    get(key) {
      return cloneDeep(this.data)[key]
    },
    async set(obj, toStorage = { local: false, sync: false }) {
      Object.entries(obj).forEach(([key, value]) => {
        console.log(`[store]${key} has been stored/updated successfully.`)

        const oldValue = this.data[key]
        this.data[key] = value

        this.callbacks.forEach(callback => callback(key, value, oldValue))

        this.ports.forEach(port => {
          port.postMessage({ key, value })
        })
      })
      await Promise.all(
        Object.entries(toStorage)
          .filter(([, value]) => value)
          .map(async ([key]) => browser.storage[key].set({
            store: { ...await getStorage(key), ...obj },
          })),
      )
    },
    subscribe(key = '', callback = () => null) {
      this.callbacks.push(($key, ...args) => {
        if (key === $key) {
          callback(...args)
        }
      })
    },
  }
}

export default createStore
