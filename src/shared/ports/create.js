import { noop, uniqueId } from 'lodash'
import browser from 'shared/browser'

const TIMEOUT_IN_SECOND = 10

const portByName = {}

const pendingMessageById = {}

const setPendingMessage = (id, { name, message, res, rej }) => {
  pendingMessageById[id] = {
    id,
    name,
    message,
    res,
    rej,
    timer: setTimeout(() => {
      rej(new Error(`Workflow Timeout! pendingMessage ${id} ${name}, message: ${JSON.stringify(message)}`))
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
  console.log('[shared/ports]connect port')

  // eslint-disable-next-line no-param-reassign
  port.originalPostMessage = port.postMessage
  // eslint-disable-next-line no-param-reassign
  port.postMessage = message => {
    port.originalPostMessage(browser.isChrome ? message : JSON.parse(JSON.stringify(message)))
  }

  port.onMessage.addListener(async ({ isResponse, id, name, isError, message }) => {
    if (isResponse) {
      const pendingMessage = pendingMessageById[id]
      if (pendingMessage) {
        clearTimeout(pendingMessage.timer)
        if (isError) {
          pendingMessage.rej(new Error(message))
        } else {
          pendingMessage.res(message)
        }
        delete pendingMessageById[id]
      } else {
        console.error(`Fail to find pendingMessage ${id}`, pendingMessageById, Object.keys(pendingMessageById))
      }
    } else {
      const response = await portByName[name].onMessage(message)
      if (!port) {
        connectPort()
      }
      port.postMessage({ isResponse: true, id, name, message: response })
    }
  })

  port.onDisconnect.addListener(() => {
    console.log('[shared/ports]port disconnected!')
    port = null
  })

  Object.values(pendingMessageById).forEach(({ id, name, message, res, rej, timer }) => {
    clearTimeout(timer)
    setPendingMessage(id, { res, rej, name, message })
    port.postMessage({ isResponse: false, id, name, message })
  })
}

connectPort()

browser.runtime.onMessage.addListener(message => {
  if (message === 'background alive') {
    connectPort()
  }
})

const create = (name, { onMessage = noop } = {}) => {
  portByName[name] = {
    name,
    postMessage: message => new Promise((res, rej) => {
      const id = uniqueId()
      setPendingMessage(id, { res, rej, name, message })
      if (!port) {
        connectPort()
      }
      port.postMessage({ isResponse: false, id, name, message })
    }),
    onMessage,
  }
  return portByName[name]
}

export default create
