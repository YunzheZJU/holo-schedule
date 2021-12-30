import alarm from 'alarm'
import { pull } from 'lodash'
import browser from 'webextension-polyfill'
import workflows from './workflows'

const allWorkflows = {
  ...workflows,
  isAlarmScheduled: alarm.isScheduled,
  scheduleAlarm: alarm.schedule,
  removeAlarm: alarm.remove,
}

// TODO: Use port
browser.runtime.connect({ name: 'background-alive' })
// console.log('background workflows send message', Date.now())
// browser.runtime.sendMessage('background alive').then(response => {
//   console.log(`background workflows on message response: ${response}`, Date.now())
// }).catch(err => {
//   console.log('background workflows on message error', err, Date.now())
// })

const ports = []

const onConnect = port => {
  // console.log('background workflows on connect', port.name)
  if (port.name !== 'workflows') return

  ports.push(port)

  port.onMessage.addListener(async ({ id, name, args }) => {
    const { [name]: workflow } = allWorkflows

    // console.log('background workflows post message', name, id, workflow && await workflow(...args), workflow)
    port.postMessage({ id, data: workflow && await workflow(...args) })
  })

  port.onDisconnect.addListener(() => pull(ports, port))
}

const init = () => {
  // console.log('background workflows init')
  browser.runtime.onConnect.addListener(onConnect)
}

export default {
  ...allWorkflows,
  init,
}
