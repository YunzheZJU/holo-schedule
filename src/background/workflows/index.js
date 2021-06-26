import dayjs from 'dayjs'
import {
  differenceBy,
  filter,
  findLastIndex,
  groupBy,
  partition,
  range,
  reverse,
  uniqBy,
} from 'lodash'
import {
  getChannels,
  getEndedLives,
  getHotnessesOfLives,
  getMembers,
  getOpenLives,
} from 'requests'
import {
  APPEARANCE,
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
    [ENDED_LIVES]: reverse(uniqBy([...reverse(cashedLives), ...lives], 'id')),
  })

  return getCachedEndedLives()
}

const clearCachedEndedLives = () => store.set({ [ENDED_LIVES]: [] })

const getCachedCurrentLives = () => store.get(CURRENT_LIVES)

const getCachedScheduledLives = () => store.get(SCHEDULED_LIVES)

const syncOpenLives = async () => {
  const [currentLives, scheduledLives] = partition(filterLives(await getOpenLives({
    startBefore: getUnixAfterDays(7),
  })), ({ start_at: startAt }) => dayjs().isAfter(startAt))

  await browser.browserAction.setBadgeText({ text: currentLives.length.toString() })

  console.log(`[syncLives]Badge text has been set to ${currentLives.length}`)

  // Subscription is simplified cause here is the only mutation of currentLives
  const endedLives = getCachedEndedLives() ?? []
  // Skip if endedLives is empty
  if (endedLives.length > 0) {
    const newEndedLives = differenceBy((getCachedCurrentLives() ?? []), currentLives, 'id').map(live => ({
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
  }

  await store.set({
    [CURRENT_LIVES]: currentLives,
    [SCHEDULED_LIVES]: scheduledLives,
    [ENDED_LIVES]: endedLives,
  })

  return [...currentLives, ...scheduledLives]
}

const syncHotnesses = async (lives = []) => {
  if (lives.length === 0) {
    return
  }

  const hotnessesByLiveId = groupBy(await getHotnessesOfLives(lives, { limit: 1000 }), 'live_id')

  await store.set({
    [ENDED_LIVES]: (getCachedEndedLives() ?? []).map(live => {
      if (live['id'] in hotnessesByLiveId) {
        return { ...live, hotnesses: hotnessesByLiveId[live['id']] }
      }

      return live
    }),
  })
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
  return syncOpenLives()
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

const setAppearance = appearance => store.set(
  { [APPEARANCE]: appearance },
  { local: true },
)

export default {
  filterByTitle,
  filterBySubscription,
  getCachedCurrentLives,
  getCachedEndedLives,
  syncEndedLives,
  clearCachedEndedLives,
  getCachedScheduledLives,
  syncOpenLives,
  syncHotnesses,
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
  setAppearance,
}
