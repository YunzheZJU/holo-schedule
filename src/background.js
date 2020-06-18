import browser from 'webextension-polyfill'
import { syncLives } from './workflows'

const handleAlarm = async (alarmInfo) => {
  console.log(`[handleAlarm]On alarm ${alarmInfo.name}`)

  await syncLives().catch(err => console.error(err))
}

browser.alarms.onAlarm.addListener(handleAlarm)

browser.alarms.create('fetch-data-alarm', {
  periodInMinutes: 1,
})
