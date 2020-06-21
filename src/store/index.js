import { cloneDeep } from 'lodash'
import browser from 'webextension-polyfill'

const store = {
  data: {},
  async init() {
    const { store = {} } = await browser.storage.local.get('store')
    this.data = store
  },
  get(key) {
    return { [key]: cloneDeep(this.data)[key] }
  },
  async set(obj) {
    Object.entries(obj).map(([key, value]) => {
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