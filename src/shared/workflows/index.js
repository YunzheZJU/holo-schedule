import { uniqueId } from 'lodash'
import browser from 'webextension-polyfill'

const workflowById = {}

const setWorkflow = (id, { name, args, res, rej }) => {
  workflowById[id] = {
    id,
    name,
    args,
    res,
    rej,
    timer: setTimeout(() => {
      rej(new Error(`Timeout! workflow ${id} ${name}, args: ${JSON.stringify(args)}`))
      delete workflowById[id]
    }, 10 * 1000),
  }
}

let port = null

const connectPort = () => {
  port = browser.runtime.connect({ name: 'workflows' })
  // console.log('shared workflows connect port', port, Date.now())

  port.onMessage.addListener(({ id, data }) => {
    const workflow = workflowById[id]
    if (workflow) {
      clearTimeout(workflow.timer)
      workflow.res(data)
      delete workflowById[id]
    } else {
      console.error(`Fail to find workflow ${id}`)
    }
  })

  port.onDisconnect.addListener(() => {
    // console.log(`shared workflows port ${port} disconnected!`, Date.now())
    port = null
  })

  Object.values(workflowById).forEach(({ id, name, args, res, rej, timer }) => {
    clearTimeout(timer)
    setWorkflow(id, { name, args, res, rej })
    // console.log('postMessage 1', Date.now())
    port.postMessage({ id, name, args })
  })
}

// console.log('connectPort 1', Date.now())
connectPort()

// browser.runtime.onConnect.addListener(({ name }) => {
//   console.log('shared/workflows on connect', name, Date.now())
//   if (name === 'background-alive') {
//     console.log('connectPort 2', Date.now())
//     connectPort()
//   }
// })
// browser.runtime.onMessage.addListener((message, _, sendResponse) => {
//   console.log('on message', Date.now())
//   if (message === 'background alive') {
//     console.log('connectPort 2', Date.now())
//     connectPort()
//     sendResponse('hi from shared/workflows')
//   }
// })

const workflows = new Proxy({}, {
  get(target, name, receiver) {
    // console.log('on workflow', name, Date.now())
    if (name in target) {
      return Reflect.get(target, name, receiver)
    }

    return (...args) => new Promise((res, rej) => {
      const id = uniqueId()
      setWorkflow(id, { name, args, res, rej })
      if (!port) {
        // console.log('connectPort 3', Date.now())
        connectPort()
      }
      // console.log('postMessage 2', Date.now())
      port.postMessage({ id, name, args })
    })
  },
})

export default workflows
