import browser from 'webextension-polyfill'
import { getCurrentLives, getMembers, getChannels } from './requests'

const syncLives = async () => {
  // TODO: Filter bilibili lives
  // TODO: Fetch all lives if lives.length < total
  const { lives, total } = await getCurrentLives()

  await browser.browserAction.setBadgeText({ text: total.toString() })

  console.log(`[syncLives]Badge text has been set to ${total}`)

  await browser.storage.local.set({ lives })

  console.log(`[syncLives]Storage lives has been set successfully.`)
}

const getCachedLives = async () => {
  const { lives } = await browser.storage.local.get('lives')
  return lives
}

const syncChannels = async () => {
  const { channels } = await getChannels()

  await browser.storage.local.set({ channels })

  console.log(`[syncChannels]Storage channels has been set successfully.`)
}

const getCachedChannels = async () => {
  const { channels } = await browser.storage.local.get('channels')
  return channels
}

const syncMembers = async () => {
  const members = await getMembers()

  await browser.storage.local.set({ members })

  console.log(`[syncMembers]Storage members has been set successfully.`)
}

const getCachedMembers = async () => {
  const { members } = await browser.storage.local.get('members')
  return members
}

export {
  syncLives,
  getCachedLives,
  syncChannels,
  getCachedChannels,
  syncMembers,
  getCachedMembers,
}