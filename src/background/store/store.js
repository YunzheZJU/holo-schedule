import { cloneDeep, pull } from 'lodash'
import browser from 'webextension-polyfill'

const storage = browser.storage.local

const createStore = () => {
  const getStorage = async () => {
    const { store: $store = {} } = await storage.get('store')
    return $store
  }

  const ports = []

  const onConnect = port => {
    if (port.name !== 'store') return

    ports.push(port)

    port.onDisconnect.addListener(() => pull(ports, port))
  }

  return {
    data: {},
    callbacks: [],
    ports,
    async init() {
      await this.set(await getStorage())
      browser.runtime.onConnect.addListener(onConnect)
    },
    get(key) {
      return cloneDeep(this.data)[key]
    },
    async set(obj, toStorage = false) {
      Object.entries(obj).forEach(([key, value]) => {
        console.log(`[store]${key} has been stored/updated successfully.`)

        const oldValue = this.data[key]
        this.data[key] = value

        this.callbacks.forEach(callback => callback(key, value, oldValue))

        this.ports.forEach(port => {
          port.postMessage({ key, value })
        })
      })
      if (toStorage) {
        await storage.set({ store: { ...await getStorage(), ...obj } })
      }
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
