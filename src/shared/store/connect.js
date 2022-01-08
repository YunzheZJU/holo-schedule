import create from 'shared/ports/create'

const connect = store => {
  create('store', {
    onMessage: (({ key, value }) => {
      // Ignore unwanted state changes
      if (!Object.getOwnPropertyDescriptor(store.state, key)) {
        return
      }

      store.commit(key, value)
    }),
  })
}

export default connect
