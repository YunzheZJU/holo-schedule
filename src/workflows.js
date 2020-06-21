import browser from 'webextension-polyfill'
import { getChannels, getCurrentLives, getMembers } from './requests'
import store from './store'

const getCachedLives = () => store.get('lives')['lives']

const syncLives = async () => {
  // TODO: Filter bilibili lives
  // TODO: Fetch all lives if lives.length < total
  const { lives, total } = await getCurrentLives()

  await browser.browserAction.setBadgeText({ text: total.toString() })

  console.log(`[syncLives]Badge text has been set to ${total}`)

  await store.set({ lives })

  return getCachedLives()
}

const getCachedChannels = () => store.get('channels')['channels']

const syncChannels = async () => {
  const { channels } = await getChannels()

  await store.set({ channels })

  return getCachedChannels()
}

const getCachedMembers = () => store.get('members')['members']

const syncMembers = async () => {
  const members = await getMembers()

  await store.set({ members })

  return getCachedMembers()
}

export default {
  getCachedLives,
  syncLives,
  getCachedChannels,
  syncChannels,
  getCachedMembers,
  syncMembers,
}