import { getCurrentLives } from './requests'

const browser = require('webextension-polyfill')

const handleAlarm = async (alarmInfo) => {
  try {
    console.log(`[handleAlarm]On alarm ${alarmInfo.name}`)

    const { lives: currentLives } = await getCurrentLives()

    await browser.browserAction.setBadgeText({ text: currentLives.length.toString() })

    console.log(`[handleAlarm]Badge text is set to ${currentLives.length}`)
  } catch (err) {
    console.error(err)
  }
}

browser.alarms.onAlarm.addListener(handleAlarm)

browser.alarms.create('fetch-data-alarm', {
  periodInMinutes: 0.1,
})
