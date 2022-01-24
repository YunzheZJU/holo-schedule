import alarm from 'alarm'
import i18n from 'i18n'
import { differenceBy, reject } from 'lodash'
import * as requests from 'requests'
import browser from 'shared/browser'
import { BG_INIT_ERROR, ENDED_LIVES } from 'shared/store/keys'
import store from 'store'
import { getUnix } from 'utils'
import workflows from 'workflows'

let isStartUp = false

const ALARM_NAME = 'fetch-data-alarm'

const {
  syncChannels,
  syncOpenLives,
  syncMembers,
  setIsPopupFirstRun,
  clearCachedEndedLives,
  getLastSuccessRequestTime,
  setLastSuccessRequestTime,
} = workflows

const handleAlarm = async ({ name }) => {
  if (name === ALARM_NAME) {
    await syncOpenLives().catch(err => console.error(err))
  }
}

const initOnce = async () => {
  global.workflows = workflows
  global.store = store
  global.alarm = alarm

  await store.init()
  await alarm.init(store)
  await i18n.init(store)
  await workflows.init()

  if (isStartUp) {
    // Use new state
    await clearCachedEndedLives()
    await setIsPopupFirstRun(true)
    console.log('[background]States have been cleared.')
  }

  requests.onSuccessRequest.addEventListener(() => {
    const lastSuccessRequestTime = getLastSuccessRequestTime() ?? getUnix()
    const timestamp = getUnix()
    if (timestamp - lastSuccessRequestTime > 60 * 5) {
      clearCachedEndedLives()
    }
    setLastSuccessRequestTime(timestamp)
  })

  store.subscribe(ENDED_LIVES, async (lives, prevLives) => workflows.syncHotnesses(
    reject(differenceBy(lives, prevLives, 'id'), 'hotnesses'),
  ))

  browser.alarms.onAlarm.addListener(handleAlarm)
  browser.alarms.create(ALARM_NAME, { periodInMinutes: 1 })

  browser.runtime.sendMessage('background alive').catch(err => {
    if (err.message.startsWith('Could not establish connection.')) {
      console.log('[background]on message error. Keep calm, this error is in expect.')
    } else {
      console.log('[background]on message error', err.message)
    }
  })
}

const initRetryable = () => (
  isStartUp ? Promise.all([syncOpenLives(), syncChannels(), syncMembers()]) : syncOpenLives()
)

const init = async () => {
  await initOnce()
  await initRetryable().catch(() => {
    console.log('[background]Retrying...')
    return initRetryable()
  })
}

browser.runtime.onInstalled.addListener(async () => {
  console.log('[background]on installed.')
  isStartUp = true
})

browser.runtime.onStartup.addListener(async () => {
  console.log('[background]on start up.')
  isStartUp = true
})

init().then(() => console.log('[background]Init OK')).catch(err => {
  console.error(err)
  global.bgInitError = err
  return store.set({ [BG_INIT_ERROR]: err.message }, { local: false })
})
