import createStore from './store'
import storage from './storage'

const store = createStore(storage)

store.init()
  .catch(err => console.error(err))
  .then(() => console.log('[store]Init OK.'))

export default store
