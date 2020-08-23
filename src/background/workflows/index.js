import { differenceBy, filter, reverse, uniqBy } from 'lodash'
import moment from 'moment'
import {
  getChannels,
  getCurrentLives,
  getEndedLives,
  getMembers,
  getScheduledLives,
} from 'requests'
import {
  CHANNELS,
  CURRENT_LIVES,
  ENDED_LIVES,
  IS_NTF_ENABLED,
  IS_POPUP_FIRST_RUN,
  LOCALE,
  MEMBERS,
  SCHEDULED_LIVES,
  SHOULD_SYNC_SETTINGS,
} from 'shared/store/keys'
import store from 'store'
import { getUnix, getUnixAfterDays, getUnixBeforeDays } from 'utils'
import browser from 'webextension-polyfill'

const filterByTitle = lives => filter(
  lives,
  ({ platform, title }) => platform !== 'bilibili' || /B.*限/i.test(title),
)

const getCachedEndedLives = () => store.get(ENDED_LIVES)

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

  await store.set({
    [ENDED_LIVES]: uniqBy([...reverse(lives), ...cashedLives], 'id'),
  })

  return getCachedEndedLives()
}

const getCachedCurrentLives = () => store.get(CURRENT_LIVES)

const syncCurrentLives = async () => {
  const lives = filterByTitle(await getCurrentLives())

  await browser.browserAction.setBadgeText({ text: lives.length.toString() })

  console.log(`[syncLives]Badge text has been set to ${lives.length}`)

  // Subscription is simplified cause here is the only mutation of currentLives
  const newEndedLives = differenceBy((getCachedCurrentLives() ?? []), lives, 'id').map(live => ({
    ...live,
    duration: moment().diff(moment(live['start_at']), 'seconds'),
  }))
  if (newEndedLives.length > 0) {
    await store.set({
      [ENDED_LIVES]: [...(getCachedEndedLives() ?? []), ...newEndedLives],
    })
  }

  await store.set({ [CURRENT_LIVES]: lives })

  return getCachedCurrentLives()
}

const getCachedScheduledLives = () => store.get(SCHEDULED_LIVES)

const syncScheduledLives = async () => {
  const lives = filterByTitle(await getScheduledLives({
    startBefore: getUnixAfterDays(7),
  }))

  await store.set({ [SCHEDULED_LIVES]: lives })

  return getCachedScheduledLives()
}

const getCachedChannels = () => store.get(CHANNELS)

const syncChannels = async () => {
  const channels = await getChannels()

  await store.set({ [CHANNELS]: channels }, { local: true })

  return getCachedChannels()
}

const getCachedMembers = () => store.get(MEMBERS)

const syncMembers = async () => {
  const members = await getMembers()

  await store.set({ [MEMBERS]: members }, { local: true })

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

const getMember = live => {
  const channels = getCachedChannels() ?? []
  const members = getCachedMembers() ?? []
  const channel = channels.find(({ id }) => id === live['channel_id']) ?? {}
  return members.find(({ id }) => id === channel['member_id']) ?? {}
}

const toggleIsNtfEnabled = () => store.set(
  { [IS_NTF_ENABLED]: !store.get(IS_NTF_ENABLED) },
  { local: true, sync: true },
)

const getLocale = () => store.get(LOCALE)

const setLocale = locale => store.set(
  { [LOCALE]: locale },
  { local: true, sync: true },
)

const setIsPopupFirstRun = boolean => store.set({ [IS_POPUP_FIRST_RUN]: boolean })

const toggleShouldSyncSettings = () => store.set(
  { [SHOULD_SYNC_SETTINGS]: !store.get(SHOULD_SYNC_SETTINGS) },
  { local: true },
)

const downloadSettings = store.downloadFromSync

export default {
  filterByTitle,
  getCachedCurrentLives,
  syncCurrentLives,
  getCachedEndedLives,
  syncEndedLives,
  getCachedScheduledLives,
  syncScheduledLives,
  getCachedChannels,
  syncChannels,
  getCachedMembers,
  syncMembers,
  getCachedLives,
  syncLives,
  getMember,
  toggleIsNtfEnabled,
  getLocale,
  setLocale,
  setIsPopupFirstRun,
  toggleShouldSyncSettings,
  downloadSettings,
}
