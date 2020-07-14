import browser from 'webextension-polyfill'

let port

const connect = store => {
  port = browser.runtime.connect({ name: 'store' })
  port.onMessage.addListener(({ key, value }) => {
    store.commit(key, value)
  })
}

export default connect
