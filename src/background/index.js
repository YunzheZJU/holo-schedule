import alarm from 'alarm'
import { LOCALE } from 'shared/store/keys'
import store from 'store'
import browser from 'webextension-polyfill'
import workflows from 'workflows'

const ALARM_NAME = 'fetch-data-alarm'

const {
  syncChannels, syncCurrentLives, syncScheduledLives, syncMembers, getLocale,
} = workflows

const handleAlarm = async ({ name }) => {
  if (name === ALARM_NAME) {
    await syncCurrentLives()
      .then(() => syncScheduledLives())
      .catch(err => console.error(err))
  }
}

const initOnce = async () => {
  window.workflows = workflows
  window.store = store
  window.alarm = alarm

  await alarm.init(store)
  await store.set(
    { [LOCALE]: getLocale() ?? browser.i18n.getUILanguage() },
    true,
  )

  browser.alarms.onAlarm.addListener(handleAlarm)

  browser.alarms.create(ALARM_NAME, { periodInMinutes: 1 })
}

const initRetryable = () => Promise.all([syncCurrentLives(), syncChannels(), syncMembers()])

const init = async () => {
  await initOnce()
  await initRetryable().catch(() => {
    console.log('Retrying...')
    return initRetryable()
  })
}

init().then(() => console.log('[background]Init OK')).catch(err => {
  console.error(err)
  window.bgInitError = err
})
