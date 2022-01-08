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

  // eslint-disable-next-line no-param-reassign
  port.originalPostMessage = port.postMessage
  // eslint-disable-next-line no-param-reassign
  port.postMessage = message => {
    try {
      port.originalPostMessage(browser.isChrome ? message : JSON.parse(JSON.stringify(message)))
    } catch (err) {
      console.error(err)
    }
  }

  port.onMessage.addListener(async ({ isResponse, id, name, message }) => {
    if (isResponse) {
      // Not supported
      return
    }

    if (!portByName[name]) {
      console.log(`[background/ports]failed to find port ${name}`)
      return
    }

    try {
      const response = await portByName[name].onMessage(message)
      port.postMessage({ isResponse: true, id, name, message: response })
    } catch (error) {
      port.postMessage({ isResponse: true, id, name, message: error.message, isError: true })
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
