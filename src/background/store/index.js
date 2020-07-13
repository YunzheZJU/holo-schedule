import createStore from './store'

const store = createStore()

store.init()
  .catch(err => console.error(err))
  .then(() => console.log('[store]Init OK.'))

export default store
