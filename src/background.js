import browser from 'webextension-polyfill'
import { syncCurrentLives } from './workflows'

const handleAlarm = async (alarmInfo) => {
  console.log(`[handleAlarm]On alarm ${alarmInfo.name}`)

  await syncCurrentLives().catch(err => console.error(err))
}

browser.alarms.onAlarm.addListener(handleAlarm)

browser.alarms.create('fetch-data-alarm', {
  periodInMinutes: 0.1,
})
