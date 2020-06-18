import browser from 'webextension-polyfill'
import { getCurrentLives } from './requests'

const syncCurrentLives = async () => {
  // TODO: Filter bilibili lives
  const { lives: currentLives } = await getCurrentLives()

  await browser.browserAction.setBadgeText({ text: currentLives.length.toString() })

  console.log(`[syncCurrentLives]Badge text has been set to ${currentLives.length}`)

  await browser.storage.local.set({ currentLives })

  console.log(`[syncCurrentLives]Storage currentLives has been set successfully.`)
}

export {
  syncCurrentLives,
}