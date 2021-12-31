import { noop, uniqueId } from 'lodash'
import browser from 'shared/browser'

const TIMEOUT_IN_SECOND = 10

const portByName = {}

const pendingMessageById = {}

const setPendingMessage = (id, { name, message, res, rej }) => {
  console.log('[shared/ports]setPendingMessage', id)
  pendingMessageById[id] = {
    id,
    name,
    message,
    res,
    rej,
    timer: setTimeout(() => {
      rej(new Error(`Timeout! pendingMessage ${id} ${name}, message: ${JSON.stringify(message)}`))
      delete pendingMessageById[id]
    }, TIMEOUT_IN_SECOND * 1000),
  }
}

let port = null

const connectPort = () => {
  if (port) {
    port.disconnect()
  }

  port = browser.runtime.connect({ name: 'port' })
  console.log('[shared/ports]connect port', port, Date.now())

  port.onMessage.addListener(async ({ isResponse, id, name, message }) => {
    if (isResponse) {
      const pendingMessage = pendingMessageById[id]
      if (pendingMessage) {
        clearTimeout(pendingMessage.timer)
        pendingMessage.res(message)
        console.log(`[shared/ports]clear pendingMessage ${id}`)
        delete pendingMessageById[id]
      } else {
        console.error(`Fail to find pendingMessage ${id}`, pendingMessageById, Object.keys(pendingMessageById))
      }
    } else {
      const response = await portByName[name].onMessage(message)
      if (!port) {
        console.log('[shared/ports]connectPort @4', Date.now())
        connectPort()
      }
      port.postMessage({ isResponse: true, id, name, message: response })
    }
  })

  port.onDisconnect.addListener(() => {
    console.log(`[shared/ports]!!!!!!!!!!shared/ports port ${port} disconnected!`, Date.now())
    port = null
  })

  Object.values(pendingMessageById).forEach(({ id, name, message, res, rej, timer }) => {
    clearTimeout(timer)
    setPendingMessage(id, { res, rej, name, message })
    console.log('[shared/ports]postMessage in migration', Date.now())
    port.postMessage({ isResponse: false, id, name, message })
  })
}

console.log('[shared/ports]connectPort on init', Date.now())
connectPort()

browser.runtime.onMessage.addListener((message, _, sendResponse) => {
  console.log('[shared/ports]on message', Date.now())
  if (message === 'background alive') {
    console.log('[shared/ports]connectPort on background message', Date.now())
    connectPort()
    sendResponse('hi from shared/ports')
  }
})

const create = (name, { onMessage = noop } = {}) => {
  portByName[name] = {
    name,
    postMessage: message => new Promise((res, rej) => {
      const id = uniqueId()
      setPendingMessage(id, { res, rej, name, message })
      if (!port) {
        console.log('[shared/ports]connectPort before postMessage', Date.now())
        connectPort()
      }
      port.postMessage({ isResponse: false, id, name, message })
    }),
    onMessage,
  }
  return portByName[name]
}

export default create
