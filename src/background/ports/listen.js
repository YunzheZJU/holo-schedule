import { noop, pull } from 'lodash'
import browser from 'webextension-polyfill'

const portByName = {}

const ports = []

browser.runtime.onConnect.addListener(port => {
  console.log('background ports/receive on connect', port.name)
  if (port.name !== 'port') return

  ports.push(port)

  Object.values(portByName).forEach($port => {
    $port.onConnect($port)
  })

  port.onMessage.addListener(async ({ isResponse, id, name, data }) => {
    if (isResponse) {
      // Not supported
    } else {
      const response = await portByName[name].onMessage(data)
      console.log('background workflows respond message', name, id, response)
      port.postMessage({ isResponse: true, id, name, data: response })
    }
  })

  port.onDisconnect.addListener(() => pull(ports, port))
})

const listen = (name, { onConnect = noop, onMessage = noop } = {}) => {
  portByName[name] = {
    onConnect,
    onMessage,
    postMessage: message => {
      ports.forEach(port => {
        port.postMessage({ isResponse: false, name, message })
      })
    },
  }
  return portByName[name]
}

export default listen
