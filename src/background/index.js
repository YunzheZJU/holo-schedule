import alarm from 'alarm'
import i18n from 'i18n'
import { differenceBy, reject } from 'lodash'
import * as requests from 'requests'
import browser from 'shared/browser'
import { BG_INIT_ERROR, ENDED_LIVES, LAST_ACTIVE_TIME } from 'shared/store/keys'
import store from 'store'
import { getUnix } from 'utils'
import workflows from 'workflows'

const ALARM_NAME = 'fetch-data-alarm'

const {
  syncChannels,
  syncOpenLives,
  syncMembers,
  setIsPopupFirstRun,
  clearCachedEndedLives,
} = workflows

// TODO: Test
const keepActive = async onLongSilence => {
  const timestamp = getUnix()
  const lastActiveTime = await store.get(LAST_ACTIVE_TIME)

  await store.set({ [LAST_ACTIVE_TIME]: timestamp })
  if (timestamp - lastActiveTime > 60 * 5) {
    await onLongSilence()
  }
}

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

  await keepActive(async () => {
    // Use new state
    await clearCachedEndedLives()
    await setIsPopupFirstRun(true)
  })

  requests.onSuccessRequest.addEventListener(() => keepActive(clearCachedEndedLives))

  store.subscribe(ENDED_LIVES, async (lives, prevLives) => workflows.syncHotnesses(
    reject(differenceBy(lives, prevLives, 'id'), 'hotnesses'),
  ))

  browser.alarms.onAlarm.addListener(handleAlarm)
  browser.alarms.create(ALARM_NAME, { periodInMinutes: 60 })

  console.log('[background]send message', Date.now())
  browser.runtime.sendMessage('background alive').then(response => {
    console.log(`[background]on message response: ${response}`, Date.now())
  }).catch(err => {
    console.log('[background]on message error', err, Date.now())
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

init().then(() => console.log('[background]Init OK')).catch(err => {
  console.error(err)
  global.bgInitError = err
  return store.set({ [BG_INIT_ERROR]: err.message })
})
