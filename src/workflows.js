import browser from 'webextension-polyfill'
import { getCurrentLives } from './requests'

const syncLives = async () => {
  // TODO: Filter bilibili lives
  // TODO: Fetch all lives if lives.length < total
  const { lives, total } = await getCurrentLives()

  await browser.browserAction.setBadgeText({ text: total.toString() })

  console.log(`[syncLives]Badge text has been set to ${total}`)

  await browser.storage.local.set({ lives })

  console.log(`[syncLives]Storage Lives has been set successfully.`)
}

const getCachedLives = async () => {
  const { lives } = await browser.storage.local.get('lives')
  return lives
}

export {
  syncLives,
  getCachedLives,
}