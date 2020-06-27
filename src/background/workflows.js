import browser from 'webextension-polyfill'
import {
  getChannels,
  getCurrentLives,
  getMembers,
  getScheduledLives,
} from 'requests'
import store from 'store'

const getCachedCurrentLives = () => store.get('currentLives')

const syncCurrentLives = async () => {
  // TODO: Filter bilibili lives
  const lives = await getCurrentLives()

  await browser.browserAction.setBadgeText({ text: lives.length.toString() })

  console.log(`[syncLives]Badge text has been set to ${lives.length}`)

  await store.set({ currentLives: lives })

  return getCachedCurrentLives()
}

const getCachedScheduledLives = () => store.get('scheduledLives')

const syncScheduledLives = async () => {
  // TODO: Filter bilibili lives and free chat
  const lives = await getScheduledLives()

  await store.set({ scheduledLives: lives })

  return getCachedScheduledLives()
}

const getCachedChannels = () => store.get('channels')

const syncChannels = async () => {
  const channels = await getChannels()

  await store.set({ channels })

  return getCachedChannels()
}

const getCachedMembers = () => store.get('members')

const syncMembers = async () => {
  const members = await getMembers()

  await store.set({ members })

  return getCachedMembers()
}

const getCachedLives = type => {
  if (type === 'current') {
    return getCachedCurrentLives()
  }
  return getCachedScheduledLives()
}

const syncLives = type => {
  if (type === 'current') {
    return syncCurrentLives()
  }
  return syncScheduledLives()
}

export default {
  getCachedCurrentLives,
  syncCurrentLives,
  getCachedScheduledLives,
  syncScheduledLives,
  getCachedChannels,
  syncChannels,
  getCachedMembers,
  syncMembers,
  getCachedLives,
  syncLives,
}
