import dayjs from 'dayjs'
import _, { differenceBy, filter, groupBy, orderBy, partition, range, reverse, uniqBy } from 'lodash'
import { getChannels, getEndedLives, getHotnessesOfLives, getMembers, getOpenLives } from 'requests'
import browser from 'shared/browser'
import {
  APPEARANCE,
  CHANNELS,
  CURRENT_LIVES,
  ENDED_LIVES,
  IS_30_HOURS_ENABLED,
  IS_NTF_ENABLED,
  IS_POPUP_FIRST_RUN,
  LAST_SUCCESS_REQUEST_TIME,
  LOCALE,
  MEMBERS,
  SCHEDULED_LIVES,
  SHOULD_SYNC_SETTINGS,
  SUBSCRIPTION_BY_MEMBER,
} from 'shared/store/keys'
import store from 'store'
import { getMembersMask, getUnix, getUnixAfterDays, getUnixBeforeDays, limitRight } from 'utils'

const MAX_LIVES_LENGTH = 250

const getCachedChannels = () => store.get(CHANNELS)

const getCachedMembers = () => store.get(MEMBERS)

const getMember = live => {
  const channels = getCachedChannels() ?? []
  const members = getCachedMembers() ?? []
  const channel = channels.find(({ id }) => id === live['channel_id']) ?? {}
  return members.find(({ id }) => id === channel['member_id']) ?? {}
}

const getMemberId = live => getMember(live).id

const filterByTitle = lives => filter(
  lives,
  live => {
    // Ensure lives of Hololive China members at Bilibili are kept
    // eslint-disable-next-line no-use-before-define
    if (range(45, 51).includes(getMemberId(live))) {
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
    live => subscriptionByMember[getMemberId(live)] ?? true,
  )
}

const filterLives = lives => [filterByTitle, filterBySubscription].reduce(
  (prev, next) => next(prev),
  lives,
)

const extractTopic = ({ title }) => (title.replace(/[\s\d#＃]/g, '').match(/[≪《【[「]([^≪《【[「]+?)[≫》】\]」]/)?.[1] || '').toLowerCase()

// 1. Live with smaller start_at exists earlier
// 2. Lives with the same topic are placed together and ordered by member_id and id
// 3. Order of different topics are decided by their first element
const sortLives = lives => _(lives)
  .groupBy('start_at')
  .map(livesGroup => _(livesGroup)
    .groupBy(extractTopic)
    .map(group => orderBy(group, [live => getMemberId(live), ({ id }) => id]))
    .orderBy([([live]) => getMemberId(live), ([{ id }]) => id])
    .flatten()
    .value())
  .sortBy(([live]) => live['start_at'])
  .flatten()
  .value()

const getSubscriptionByMember = () => store.get(SUBSCRIPTION_BY_MEMBER)

const setSubscriptionByMember = subscriptionByMember => store.set(
  { [SUBSCRIPTION_BY_MEMBER]: subscriptionByMember },
  { sync: true },
)

const getCachedEndedLives = () => store.get(ENDED_LIVES)

const syncEndedLives = async () => {
  const cashedLives = getCachedEndedLives() ?? []
  const startBefore = cashedLives.length ? Math.min(
    ...cashedLives.map(({ start_at: startAt }) => getUnix(startAt)),
  ) + 1 : getUnix()

  const lives = filterLives(await getEndedLives({
    membersMask: getMembersMask(getSubscriptionByMember()),
    startAfter: getUnixBeforeDays(3),
    startBefore,
    limit: 25,
  }))

  await Promise.resolve({
    [ENDED_LIVES]: limitRight(sortLives(uniqBy([...reverse(lives), ...cashedLives], 'id')), MAX_LIVES_LENGTH),
  }).then(data => store.set(data))
    .catch(data => store.set(data, { local: false }))

  return getCachedEndedLives()
}

const clearCachedEndedLives = () => store.set({ [ENDED_LIVES]: [] })

const updateSubscriptionByMember = async (memberId, subscribed) => {
  await setSubscriptionByMember({
    ...getSubscriptionByMember(),
    [memberId]: subscribed,
  })
  await clearCachedEndedLives()
}

const getCachedCurrentLives = () => store.get(CURRENT_LIVES)

const getCachedScheduledLives = () => store.get(SCHEDULED_LIVES)

const syncOpenLives = async () => {
  const [currentLives, scheduledLives] = partition(filterLives(await getOpenLives({
    membersMask: getMembersMask(getSubscriptionByMember()),
    startBefore: getUnixAfterDays(7),
    limit: 100,
  })), ({ start_at: startAt }) => dayjs().isAfter(startAt))

  await browser.action.setBadgeText({ text: currentLives.length.toString() })

  console.log(`[background/workflow]Badge text has been set to ${currentLives.length}`)

  // Subscription is simplified cause here is the only mutation of currentLives
  const endedLives = getCachedEndedLives() ?? []
  // Skip if endedLives is empty
  if (endedLives.length > 0) {
    endedLives.push(...differenceBy((getCachedCurrentLives() ?? []), currentLives, 'id').map(live => ({
      ...live, duration: dayjs().diff(dayjs(live['start_at']), 'second'),
    })))
  }

  await Promise.resolve({
    [CURRENT_LIVES]: sortLives(currentLives),
    [SCHEDULED_LIVES]: sortLives(scheduledLives),
    [ENDED_LIVES]: limitRight(sortLives(filterLives(uniqBy(endedLives, 'id'))), MAX_LIVES_LENGTH),
  }).then(data => store.set(data))
    .catch(data => store.set(data, { local: false }))

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

const syncChannels = async () => {
  const channels = await getChannels()

  await store.set({ [CHANNELS]: channels })

  return getCachedChannels()
}

const syncMembers = async () => {
  const members = await getMembers()
  const subscriptionByMember = await getSubscriptionByMember() ?? {}

  await store.set({ [MEMBERS]: members })

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

const setIsNtfEnabled = boolean => store.set(
  { [IS_NTF_ENABLED]: boolean },
  { sync: true },
)

const getLocale = () => store.get(LOCALE)

const setLocale = locale => store.set(
  { [LOCALE]: locale },
  { sync: true },
)

const setIsPopupFirstRun = boolean => store.set(
  { [IS_POPUP_FIRST_RUN]: boolean },
)

const setShouldSyncSettings = boolean => store.set(
  { [SHOULD_SYNC_SETTINGS]: boolean },
)

const downloadSettings = store.downloadFromSync

const setIs30HoursEnabled = boolean => store.set(
  { [IS_30_HOURS_ENABLED]: boolean },
  { sync: true },
)

const setAppearance = appearance => store.set(
  { [APPEARANCE]: appearance },
)

const ping = () => null

const getLastSuccessRequestTime = () => store.get(LAST_SUCCESS_REQUEST_TIME)

const setLastSuccessRequestTime = lastSuccessRequestTime => store.set(
  { [LAST_SUCCESS_REQUEST_TIME]: lastSuccessRequestTime },
)

export default {
  getCachedChannels,
  getCachedMembers,
  getMember,
  filterByTitle,
  filterBySubscription,
  extractTopic,
  sortLives,
  getCachedCurrentLives,
  getCachedEndedLives,
  syncEndedLives,
  clearCachedEndedLives,
  getCachedScheduledLives,
  syncOpenLives,
  syncHotnesses,
  syncChannels,
  syncMembers,
  getCachedLives,
  syncLives,
  setIsNtfEnabled,
  getLocale,
  setLocale,
  setIsPopupFirstRun,
  setShouldSyncSettings,
  downloadSettings,
  getSubscriptionByMember,
  setSubscriptionByMember,
  updateSubscriptionByMember,
  setIs30HoursEnabled,
  setAppearance,
  ping,
  getLastSuccessRequestTime,
  setLastSuccessRequestTime,
}
