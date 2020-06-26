import browser from 'webextension-polyfill'
import workflows from 'workflows'

window.workflows = workflows

const { syncChannels, syncCurrentLives, syncMembers } = workflows

const handleAlarm = async (alarmInfo) => {
  console.log(`[handleAlarm]On alarm ${alarmInfo.name}`)

  await syncCurrentLives().catch(err => console.error(err))
}

browser.alarms.onAlarm.addListener(handleAlarm)

browser.alarms.create('fetch-data-alarm', {
  periodInMinutes: 1,
})

const init = async () => {
  return Promise.all([syncCurrentLives(), syncChannels(), syncMembers()])
}

init()
  .catch((err) => {
    console.error(err)
    console.log('Retrying...')
    return init()
  })
  .then(() => console.log('[background]Init OK'))
  .catch(err => console.error(err))
