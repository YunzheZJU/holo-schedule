import { cloneDeep, noop } from 'lodash'
import listen from 'ports/listen'
import browser from 'shared/browser'
import { SHOULD_SYNC_SETTINGS } from 'shared/store/keys'

const { storage } = browser

const getStorage = async storageArea => {
  const { store = {} } = await storage[storageArea].get('store')
  return store
}

const taskQueue = []
let isExecutingTask = false

const execTask = () => {
  if (taskQueue.length === 0 || isExecutingTask) {
    return
  }

  const { task, res, rej } = taskQueue.shift()

  isExecutingTask = true
  task()
    .finally(() => {
      isExecutingTask = false
    })
    .then(res)
    .catch(rej)
    .then(execTask)
}

const withLock = task => new Promise((res, rej) => {
  taskQueue.push({ task, res, rej })
  execTask()
})

const createStore = () => {
  const data = {}
  const dataToSync = {}

  const callbacks = []
  console.log('[background/store]listening to store')
  const port = listen('store', {
    onConnect: $port => Object.entries(data).forEach(([key, value]) => {
      $port.postMessage({ key, value })
    }),
  })

  const uploadToSync = async () => {
    if (data[SHOULD_SYNC_SETTINGS]) {
      await storage.sync.set({ store: dataToSync })
    }
  }

  const set = async (obj, { local = true, sync = false } = { local: true, sync: false }) => {
    Object.entries(obj).forEach(([key, value]) => {
      console.log(`[background/store]${key} has been stored/updated successfully.`)

      const oldValue = data[key]
      data[key] = value

      callbacks.forEach(callback => callback(key, value, oldValue))

      port.postMessage({ key, value })
    })
    if (local) {
      await withLock(async () => storage.local.set({ store: { ...await getStorage('local'), ...obj } }))
    }
    if (sync) {
      Object.assign(dataToSync, obj)

      await uploadToSync()
    }
  }

  const downloadFromSync = async () => {
    Object.assign(dataToSync, await getStorage('sync'))
    if (data[SHOULD_SYNC_SETTINGS]) {
      await set(dataToSync, { local: false })
    }
  }

  return {
    data,
    dataToSync,
    callbacks,
    downloadFromSync,
    uploadToSync,
    set,
    async init() {
      await set(await getStorage('local'), { local: false })

      await downloadFromSync()

      this.subscribe(SHOULD_SYNC_SETTINGS, async () => {
        await uploadToSync()
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
