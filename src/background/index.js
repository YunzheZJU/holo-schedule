// TODO: Clean up
import alarm from 'alarm'
import store from 'store'
import browser from 'webextension-polyfill'
import workflows from 'workflows'
import { LOCALE } from 'shared/store/keys'

window.workflows = workflows
window.store = store
window.alarm = alarm

alarm.init(store).catch(err => console.error(err))

const { syncChannels, syncCurrentLives, syncMembers, getLocale } = workflows

store.set(
  { [LOCALE]: getLocale() ?? browser.i18n.getUILanguage() },
  true,
).catch(err => console.error(err))

const handleAlarm = async alarmInfo => {
  console.log(`[handleAlarm]On alarm ${alarmInfo.name}`)

  await syncCurrentLives().catch(err => console.error(err))
}

browser.alarms.onAlarm.addListener(handleAlarm)

browser.alarms.create('fetch-data-alarm', {
  periodInMinutes: 1,
})

const init = async () => Promise.all([syncCurrentLives(), syncChannels(), syncMembers()])

init()
  .catch(err => {
    console.error(err)
    console.log('Retrying...')
    return init()
  })
  .then(() => console.log('[background]Init OK'))
  .catch(err => console.error(err))
