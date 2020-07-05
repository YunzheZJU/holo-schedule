import { reverse } from 'lodash'
import {
  getChannels,
  getCurrentLives,
  getEndedLives,
  getMembers,
  getScheduledLives,
} from 'requests'
import store from 'store'
import { getTimeAfterDays, getTimeBeforeDays } from 'utils'
import browser from 'webextension-polyfill'

const getCachedEndedLives = () => store.get('endedLives')

const getLowestStartAt = (lives = []) => {
  if (lives.length === 0) {
    return undefined
  }
  return Math.min(...lives.map(({ start_at: startAt }) => new Date(startAt).getTime() / 1000))
}

const syncEndedLives = async () => {
  const cashedLives = getCachedEndedLives() ?? []
  const startBefore = getLowestStartAt(cashedLives) ?? Date.now()

  // TODO: Filter bilibili lives
  const lives = await getEndedLives({
    startAfter: getTimeBeforeDays(3),
    startBefore,
    limit: 10,
  })

  const mergedLives = [...reverse(lives), ...cashedLives]

  await store.set({ endedLives: mergedLives })

  return getCachedEndedLives()
}

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
  // TODO: Filter bilibili lives
  const lives = await getScheduledLives({ startBefore: getTimeAfterDays(7) })

  await store.set({ scheduledLives: lives })

  return getCachedScheduledLives()
}

const getCachedChannels = () => store.get('channels')

const syncChannels = async () => {
  const channels = await getChannels()

  await store.set({ channels }, true)

  return getCachedChannels()
}

const getCachedMembers = () => store.get('members')

const syncMembers = async () => {
  const members = await getMembers()

  await store.set({ members }, true)

  return getCachedMembers()
}

const getCachedLives = type => {
  if (type === 'ended') {
    return getCachedEndedLives()
  }
  if (type === 'current') {
    return getCachedCurrentLives()
  }
  return getCachedScheduledLives()
}

const syncLives = type => {
  if (type === 'ended') {
    return syncEndedLives()
  }
  if (type === 'current') {
    return syncCurrentLives()
  }
  return syncScheduledLives()
}

export default {
  getCachedCurrentLives,
  syncCurrentLives,
  getCachedChannels,
  syncChannels,
  getCachedMembers,
  syncMembers,
  getCachedLives,
  syncLives,
}
