import { cloneDeep } from 'lodash'
import browser from 'webextension-polyfill'

const store = {
  data: {},
  async init() {
    const { store: $store = {} } = await browser.storage.local.get('store')
    this.data = $store
  },
  get(key) {
    return cloneDeep(this.data)[key]
  },
  async set(obj) {
    Object.entries(obj).forEach(([key, value]) => {
      console.log(`[store]${key} has been stored/updated successfully.`)
      this.data[key] = value
    })
    await browser.storage.local.set({ store: this.data })
  },
}

store.init()
  .catch(err => console.error(err))
  .then(() => console.log('[store]Init OK.'))

export default store
