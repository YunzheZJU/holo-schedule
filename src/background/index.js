import alarm from 'alarm'
import i18n from 'i18n'
import { differenceBy, reject } from 'lodash'
import * as requests from 'requests'
import browser from 'shared/browser'
import { BG_INIT_ERROR, ENDED_LIVES } from 'shared/store/keys'
import store from 'store'
import { getUnix } from 'utils'
import workflows from 'workflows'

let shouldCleanState = false

const ALARM_NAME = 'fetch-data-alarm'

const {
  syncChannels,
  syncOpenLives,
  syncMembers,
  setIsPopupFirstRun,
  clearCachedEndedLives,
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
  await workflows.init()
  await alarm.init(store)
  await i18n.init(store)

  if (shouldCleanState) {
    console.log('[background]Clean state on start up')
    // Use new state
    await clearCachedEndedLives()
    await setIsPopupFirstRun(true)
  }

  let lastSuccessRequestTime = 0
  requests.onSuccessRequest.addEventListener(() => {
    const timestamp = getUnix()
    if (timestamp - lastSuccessRequestTime > 60 * 5) {
      clearCachedEndedLives()
    }
    lastSuccessRequestTime = timestamp
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

const initRetryable = () => Promise.all([syncOpenLives(), syncChannels(), syncMembers()])

const init = async () => {
  await initOnce()
  await initRetryable().catch(() => {
    console.log('[background]Retrying...')
    return initRetryable()
  })
}

browser.runtime.onStartup.addListener(async () => {
  console.log('[background]on start up')
  shouldCleanState = true
})

init().then(() => console.log('[background]Init OK')).catch(err => {
  console.error(err)
  global.bgInitError = err
  return store.set({ [BG_INIT_ERROR]: err.message }, { local: false })
})
