import browser from 'webextension-polyfill'

let port

const connect = store => {
  port = browser.runtime.connect({ name: 'store' })
  port.onMessage.addListener(({ key, value }) => {
    // Ignore unwanted state changes
    if (!Object.getOwnPropertyDescriptor(store.state, key)) {
      return
    }

    store.commit(key, value)
  })
}

export default connect
