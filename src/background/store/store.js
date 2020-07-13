import { cloneDeep } from 'lodash'

const createStore = storage => {
  const getStorage = async () => {
    const { store: $store = {} } = await storage.get('store')
    return $store
  }

  return {
    data: {},
    callbacks: [],
    async init() {
      await this.set(await getStorage())
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
