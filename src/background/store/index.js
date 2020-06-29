import { cloneDeep } from 'lodash'
import browser from 'webextension-polyfill'

const getStorage = async () => {
  const { store: $store = {} } = await browser.storage.local.get('store')
  return $store
}

const store = {
  data: {},
  async init() {
    this.data = await getStorage()
  },
  get(key) {
    return cloneDeep(this.data)[key]
  },
  async set(obj, toStorage = false) {
    Object.entries(obj).forEach(([key, value]) => {
      console.log(`[store]${key} has been stored/updated successfully.`)
      this.data[key] = value
    })
    if (toStorage) {
      await browser.storage.local.set({ store: { ...await getStorage(), ...obj } })
    }
  },
}

store.init()
  .catch(err => console.error(err))
  .then(() => console.log('[store]Init OK.'))

export default store
