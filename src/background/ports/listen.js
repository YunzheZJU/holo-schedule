import { noop, pull } from 'lodash'
import browser from 'shared/browser'

const portByName = {}

const ports = []

browser.runtime.onConnect.addListener(port => {
  console.log('[background/ports]on connect', port.name)
  if (port.name !== 'port') return

  ports.push(port)

  Object.values(portByName).forEach($port => {
    $port.onConnect($port)
  })

  port.onMessage.addListener(async ({ isResponse, id, name, message }) => {
    if (isResponse) {
      // Not supported
      return
    }

    if (!portByName[name]) {
      console.log(`[background/ports]failed to find port ${name}`)
      return
    }

    const response = await portByName[name].onMessage(message)
    console.log('[background/ports]respond message', name, id, response)
    port.postMessage({ isResponse: true, id, name, message: response })
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