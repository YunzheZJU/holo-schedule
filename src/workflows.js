import browser from 'webextension-polyfill'
import {
  getChannels,
  getCurrentLives,
  getMembers,
  getScheduledLives,
} from './requests'
import store from './store'

const getCachedCurrentLives = () => store.get('currentLives')['currentLives']

const syncCurrentLives = async () => {
  // TODO: Filter bilibili lives
  const lives = await getCurrentLives()

  await browser.browserAction.setBadgeText({ text: lives.length.toString() })

  console.log(`[syncLives]Badge text has been set to ${lives.length}`)

  await store.set({ currentLives: lives })

  return getCachedCurrentLives()
}

const getCachedScheduledLives = () => store.get('scheduledLives')['scheduledLives']

const syncScheduledLives = async () => {
  // TODO: Filter bilibili lives and free chat
  const lives = await getScheduledLives()

  await store.set({ scheduledLives: lives })

  return getCachedScheduledLives()
}

const getCachedChannels = () => store.get('channels')['channels']

const syncChannels = async () => {
  const channels = await getChannels()

  await store.set({ channels })

  return getCachedChannels()
}

const getCachedMembers = () => store.get('members')['members']

const syncMembers = async () => {
  const members = await getMembers()

  await store.set({ members })

  return getCachedMembers()
}

const getCachedLives = (type) => {
  if (type === 'current') {
    return getCachedCurrentLives()
  }
  if (type === 'scheduled') {
    return getCachedScheduledLives()
  }
}

const syncLives = (type) => {
  if (type === 'current') {
    return syncCurrentLives()
  }
  if (type === 'scheduled') {
    return syncScheduledLives()
  }
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