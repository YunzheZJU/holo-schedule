import dayjs from 'dayjs'
import {
  differenceBy,
  filter,
  findLastIndex,
  range,
  reverse,
  uniqBy,
} from 'lodash'
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
  IS_30_HOURS_ENABLED,
  IS_NTF_ENABLED,
  IS_POPUP_FIRST_RUN,
  LOCALE,
  MEMBERS,
  SCHEDULED_LIVES,
  SHOULD_SYNC_SETTINGS,
  SUBSCRIPTION_BY_MEMBER,
} from 'shared/store/keys'
import store from 'store'
import { getUnix, getUnixAfterDays, getUnixBeforeDays } from 'utils'
import browser from 'webextension-polyfill'

const filterByTitle = lives => filter(
  lives,
  live => {
    // Ensure lives of Hololive China members at Bilibili are kept
    // eslint-disable-next-line no-use-before-define
    if (range(45, 51).includes(getMember(live)['id'])) {
      return true
    }

    const { platform, title } = live

    return platform !== 'bilibili' || /B.*限/i.test(title)
  },
)

const filterBySubscription = lives => {
  // eslint-disable-next-line no-use-before-define
  const subscriptionByMember = getSubscriptionByMember() ?? {}
  return filter(
    lives,
    // eslint-disable-next-line no-use-before-define
    live => subscriptionByMember[getMember(live)['id']] ?? true,
  )
}

const filterLives = lives => [filterByTitle, filterBySubscription].reduce(
  (prev, next) => next(prev),
  lives,
)

const getCachedEndedLives = () => store.get(ENDED_LIVES)

const syncEndedLives = async () => {
  const cashedLives = getCachedEndedLives() ?? []
  const startBefore = cashedLives.length ? Math.min(
    ...cashedLives.map(({ start_at: startAt }) => getUnix(startAt)),
  ) + 1 : getUnix()

  const lives = filterLives(await getEndedLives({
    startAfter: getUnixBeforeDays(3),
    startBefore,
    limit: 18,
  }))

  await store.set({
    [ENDED_LIVES]: uniqBy([...reverse(lives), ...cashedLives], 'id'),
  })

  return getCachedEndedLives()
}

const clearCachedEndedLives = () => store.set({ [ENDED_LIVES]: [] })

const getCachedCurrentLives = () => store.get(CURRENT_LIVES)

const syncCurrentLives = async () => {
  const lives = filterLives(await getCurrentLives())

  await browser.browserAction.setBadgeText({ text: lives.length.toString() })

  console.log(`[syncLives]Badge text has been set to ${lives.length}`)

  // Subscription is simplified cause here is the only mutation of currentLives
  const endedLives = getCachedEndedLives() ?? []
  const newEndedLives = differenceBy((getCachedCurrentLives() ?? []), lives, 'id').map(live => ({
    ...live,
    duration: dayjs().diff(dayjs(live['start_at']), 'second'),
  }))
  newEndedLives.forEach(live => {
    const index = findLastIndex(
      endedLives,
      ({ start_at: startAt }) => startAt <= live['start_at'],
    )
    endedLives.splice(index + 1, 0, live)
  })

  await store.set({ [CURRENT_LIVES]: lives, [ENDED_LIVES]: endedLives })

  return getCachedCurrentLives()
}

const getCachedScheduledLives = () => store.get(SCHEDULED_LIVES)

const syncScheduledLives = async () => {
  const lives = filterLives(await getScheduledLives({
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

const getSubscriptionByMember = () => store.get(SUBSCRIPTION_BY_MEMBER)

const setSubscriptionByMember = subscriptionByMember => store.set(
  { [SUBSCRIPTION_BY_MEMBER]: subscriptionByMember },
  { local: true, sync: true },
)

const updateSubscriptionByMember = (memberId, subscribed) => setSubscriptionByMember({
  ...getSubscriptionByMember(),
  [memberId]: subscribed,
})

const getCachedMembers = () => store.get(MEMBERS)

const syncMembers = async () => {
  const members = await getMembers()
  const subscriptionByMember = await getSubscriptionByMember() ?? {}

  await store.set({ [MEMBERS]: members }, { local: true })

  await setSubscriptionByMember({
    ...Object.fromEntries(members.map(({ id }) => ([id, true]))),
    ...subscriptionByMember,
  })

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

const toggleIs30HoursEnabled = () => store.set(
  { [IS_30_HOURS_ENABLED]: !store.get(IS_30_HOURS_ENABLED) },
  { local: true, sync: true },
)

export default {
  filterByTitle,
  filterBySubscription,
  getCachedCurrentLives,
  syncCurrentLives,
  getCachedEndedLives,
  syncEndedLives,
  clearCachedEndedLives,
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
  getSubscriptionByMember,
  setSubscriptionByMember,
  updateSubscriptionByMember,
  toggleIs30HoursEnabled,
}
