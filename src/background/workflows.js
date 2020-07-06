import { filter, reverse, uniqBy } from 'lodash'
import {
  getChannels,
  getCurrentLives,
  getEndedLives,
  getMembers,
  getScheduledLives,
} from 'requests'
import store from 'store'
import { getUnixAfterDays, getUnixBeforeDays, getUnix } from 'utils'
import browser from 'webextension-polyfill'

const filterByTitle = lives => filter(
  lives,
  ({ platform, title }) => platform !== 'bilibili' || /B.*限/.test(title),
)

const getCachedEndedLives = () => store.get('endedLives')

const syncEndedLives = async () => {
  const cashedLives = getCachedEndedLives() ?? []
  const startBefore = cashedLives.length ? Math.min(
    ...cashedLives.map(({ start_at: startAt }) => getUnix(startAt)),
  ) + 1 : getUnix()

  const lives = filterByTitle(await getEndedLives({
    startAfter: getUnixBeforeDays(3),
    startBefore,
    limit: 18,
  }))

  const endedLives = uniqBy([...reverse(lives), ...cashedLives], 'id')

  await store.set({ endedLives })

  return getCachedEndedLives()
}

const getCachedCurrentLives = () => store.get('currentLives')

const syncCurrentLives = async () => {
  const lives = filterByTitle(await getCurrentLives())

  await browser.browserAction.setBadgeText({ text: lives.length.toString() })

  console.log(`[syncLives]Badge text has been set to ${lives.length}`)

  await store.set({ currentLives: lives })

  return getCachedCurrentLives()
}

const getCachedScheduledLives = () => store.get('scheduledLives')

const syncScheduledLives = async () => {
  const lives = filterByTitle(await getScheduledLives({
    startBefore: getUnixAfterDays(7),
  }))

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
