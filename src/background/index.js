import browser from 'webextension-polyfill'
import workflows from 'workflows'
import store from 'store'
import alarm from 'alarm'

window.workflows = workflows
window.store = store
window.alarm = alarm

alarm.init(store)

const { syncChannels, syncCurrentLives, syncMembers } = workflows

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
