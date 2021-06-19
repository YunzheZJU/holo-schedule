import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import {
  getChannels,
  getCurrentLives,
  getEndedLives,
  getMembers,
  getScheduledLives,
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
import workflows from './index'

dayjs.extend(duration)

jest.mock('requests')
const unixTime = Math.floor(Date.now() / 1000)

beforeEach(() => {
  // eslint-disable-next-line no-restricted-syntax
  for (const prop of Object.getOwnPropertyNames(store.data)) {
    delete store.data[prop]
  }
})

test('should filter lives by title', async () => {
  const members = [{ id: 44 }, { id: 45 }, { id: 50 }, { id: 51 }]
  const channels = [
    { id: 1, member_id: 44 },
    { id: 2, member_id: 45 },
    { id: 3, member_id: 50 },
    { id: 4, member_id: 51 },
  ]
  const livesToFilter = [
    { platform: 'bilibili', title: '标题', channel_id: 1 },
    { platform: 'bilibili', title: '【B限】标题', channel_id: 1 },
    { platform: 'bilibili', title: '【B站限定】', channel_id: 1 },
    { platform: 'bilibili', title: '【Bilibili限定】', channel_id: 1 },
    { platform: 'bilibili', title: '【b限】标题', channel_id: 1 },
    { platform: 'bilibili', title: '【b站限定】', channel_id: 1 },
    { platform: 'bilibili', title: '【bilibili限定】', channel_id: 1 },
    { platform: 'youtube', title: '标题', channel_id: 1 },
    { platform: 'youtube', title: '【B限】标题', channel_id: 1 },
    { platform: 'youtube', title: '【B站限定】', channel_id: 1 },
    { platform: 'youtube', title: '【Bilibili限定】', channel_id: 1 },
    { platform: 'bilibili', title: 'Title', channel_id: 2 },
    { platform: 'bilibili', title: 'Title', channel_id: 3 },
    { platform: 'bilibili', title: 'Title', channel_id: 4 },
  ]
  const livesExpected = [
    { platform: 'bilibili', title: '【B限】标题', channel_id: 1 },
    { platform: 'bilibili', title: '【B站限定】', channel_id: 1 },
    { platform: 'bilibili', title: '【Bilibili限定】', channel_id: 1 },
    { platform: 'bilibili', title: '【b限】标题', channel_id: 1 },
    { platform: 'bilibili', title: '【b站限定】', channel_id: 1 },
    { platform: 'bilibili', title: '【bilibili限定】', channel_id: 1 },
    { platform: 'youtube', title: '标题', channel_id: 1 },
    { platform: 'youtube', title: '【B限】标题', channel_id: 1 },
    { platform: 'youtube', title: '【B站限定】', channel_id: 1 },
    { platform: 'youtube', title: '【Bilibili限定】', channel_id: 1 },
    { platform: 'bilibili', title: 'Title', channel_id: 2 },
    { platform: 'bilibili', title: 'Title', channel_id: 3 },
  ]

  await store.set({ [MEMBERS]: members, [CHANNELS]: channels })

  const filteredLives = workflows.filterByTitle(livesToFilter)

  expect(filteredLives).toEqual(livesExpected)
})

test('should filter lives by subscription', async () => {
  const members = [{ id: 1 }, { id: 2 }, { id: 3 }]
  const channels = [
    { id: 1, member_id: 1 },
    { id: 2, member_id: 2 },
    { id: 3, member_id: 3 },
  ]
  const liveOne = { channel_id: 1 }
  const liveTwo = { channel_id: 2 }
  const liveThree = { channel_id: 3 }
  const liveFour = { channel_id: 4 }
  const subscriptionByMember = { 1: true, 2: false }

  await store.set({
    [MEMBERS]: members,
    [CHANNELS]: channels,
    [SUBSCRIPTION_BY_MEMBER]: subscriptionByMember,
  })

  const livesToFilter = [liveOne, liveTwo, liveThree, liveFour]
  const livesExpected = [liveOne, liveThree, liveFour]

  const filteredLives = workflows.filterBySubscription(livesToFilter)

  expect(filteredLives).toEqual(livesExpected)
})

test('should get cached ended lives', async () => {
  const endedLives = [{ id: 1 }, { id: 2 }]

  expect(workflows.getCachedEndedLives()).toEqual(undefined)

  await store.set({ [ENDED_LIVES]: endedLives })

  expect(workflows.getCachedEndedLives()).toEqual(endedLives)
})

test('should clear cached ended lives', async () => {
  expect(workflows.getCachedEndedLives()).toEqual(undefined)

  await store.set({ [ENDED_LIVES]: [{ id: 1 }, { id: 2 }] })
  await workflows.clearCachedEndedLives()

  expect(workflows.getCachedEndedLives()).toEqual([])
})

test('should sync ended lives', async () => {
  Date.now = jest.fn(() => unixTime * 1000)
  // First run
  const endedLivesOne = [
    { id: 10, start_at: dayjs().subtract(3, 'hour').toISOString() },
    { id: 9, start_at: dayjs().subtract(4, 'hour').toISOString() },
  ]
  const returnValueExpectedOne = [endedLivesOne[1], endedLivesOne[0]]

  getEndedLives.mockResolvedValueOnce(endedLivesOne)

  const returnValueOne = await workflows.syncEndedLives()

  expect(getEndedLives).toHaveBeenCalledWith({
    startAfter: getUnixBeforeDays(3),
    startBefore: getUnix(),
    limit: 18,
  })
  expect(store.data[ENDED_LIVES]).toEqual(returnValueExpectedOne)
  expect(returnValueOne).toEqual(returnValueExpectedOne)
  // Second run
  getEndedLives.mockClear()
  const endedLivesTwo = [
    { id: 9, start_at: dayjs().subtract(4, 'hour').toISOString() },
    { id: 8, start_at: dayjs().subtract(5, 'hour').toISOString() },
  ]
  const returnValueExpectedTwo = [endedLivesTwo[1], ...returnValueExpectedOne]

  getEndedLives.mockResolvedValueOnce(endedLivesTwo)

  const returnValueTwo = await workflows.syncEndedLives()

  expect(getEndedLives).toHaveBeenCalledWith({
    startAfter: getUnixBeforeDays(3),
    startBefore: getUnix(returnValueExpectedOne[0].start_at) + 1,
    limit: 18,
  })
  expect(store.data[ENDED_LIVES]).toEqual(returnValueExpectedTwo)
  expect(returnValueTwo).toEqual(returnValueExpectedTwo)
  // Third run
  getEndedLives.mockClear()
  const endedLivesThree = []
  const returnValueExpectedThree = returnValueExpectedTwo

  getEndedLives.mockResolvedValueOnce(endedLivesThree)

  const returnValueThree = await workflows.syncEndedLives()

  expect(getEndedLives).toHaveBeenCalledWith({
    startAfter: getUnixBeforeDays(3),
    startBefore: getUnix(returnValueExpectedTwo[0].start_at) + 1,
    limit: 18,
  })
  expect(store.data[ENDED_LIVES]).toEqual(returnValueExpectedThree)
  expect(returnValueThree).toEqual(returnValueExpectedThree)
})

test('should get cached current lives', async () => {
  const currentLives = [{ id: 1 }, { id: 2 }]

  expect(workflows.getCachedCurrentLives()).toEqual(undefined)

  await store.set({ [CURRENT_LIVES]: currentLives })

  expect(workflows.getCachedCurrentLives()).toEqual(currentLives)
})

test('should sync current lives', async () => {
  Date.now = jest.fn(() => unixTime * 1000)

  // First run
  const currentLivesOne = [
    {
      id: 1,
      start_at: dayjs().subtract(3, 'hour').toISOString(),
      duration: null,
    },
    {
      id: 2,
      start_at: dayjs().subtract(3, 'hour').toISOString(),
      duration: null,
    },
    {
      id: 3,
      start_at: dayjs().subtract(2, 'hour').toISOString(),
      duration: null,
    },
  ]
  const endedLivesOne = []

  getCurrentLives.mockResolvedValueOnce(currentLivesOne)

  const returnValueOne = await workflows.syncCurrentLives()

  expect(browser.browserAction.setBadgeText).toHaveBeenCalledTimes(1)
  expect(browser.browserAction.setBadgeText).toHaveBeenCalledWith({ text: '3' })
  expect(store.data[CURRENT_LIVES]).toEqual(currentLivesOne)
  expect(store.data[ENDED_LIVES]).toEqual(endedLivesOne)
  expect(returnValueOne).toEqual(currentLivesOne)

  getCurrentLives.mockClear()
  browser.browserAction.setBadgeText.mockClear()

  // Second run
  const currentLivesTwo = [
    currentLivesOne[1],
    currentLivesOne[2],
    {
      id: 4,
      start_at: dayjs().subtract(1, 'hour').toISOString(),
      duration: null,
    },
  ]
  const endedLivesTwo = [
    {
      ...currentLivesOne[0],
      duration: dayjs.duration(3, 'hour').as('second'),
    },
  ]

  getCurrentLives.mockResolvedValueOnce(currentLivesTwo)

  const returnValueTwo = await workflows.syncCurrentLives()

  expect(browser.browserAction.setBadgeText).toHaveBeenCalledTimes(1)
  expect(browser.browserAction.setBadgeText).toHaveBeenCalledWith({ text: '3' })
  expect(store.data[CURRENT_LIVES]).toEqual(currentLivesTwo)
  expect(store.data[ENDED_LIVES]).toEqual([])
  expect(returnValueTwo).toEqual(currentLivesTwo)

  getCurrentLives.mockClear()
  browser.browserAction.setBadgeText.mockClear()

  // Third run
  await store.set({ [ENDED_LIVES]: endedLivesTwo })

  getCurrentLives.mockResolvedValueOnce(currentLivesTwo)

  const returnValueTwoSecond = await workflows.syncCurrentLives()

  expect(browser.browserAction.setBadgeText).toHaveBeenCalledTimes(1)
  expect(browser.browserAction.setBadgeText).toHaveBeenCalledWith({ text: '3' })
  expect(store.data[CURRENT_LIVES]).toEqual(currentLivesTwo)
  expect(store.data[ENDED_LIVES]).toEqual(endedLivesTwo)
  expect(returnValueTwoSecond).toEqual(currentLivesTwo)

  getCurrentLives.mockClear()
  browser.browserAction.setBadgeText.mockClear()

  // Third run
  const currentLivesThree = [
    currentLivesTwo[0],
    currentLivesTwo[2],
  ]
  const endedLivesThree = [
    endedLivesTwo[0],
    {
      ...currentLivesOne[2],
      duration: dayjs.duration(2, 'hour').as('second'),
    },
  ]

  getCurrentLives.mockResolvedValueOnce(currentLivesThree)

  const returnValueThree = await workflows.syncCurrentLives()

  expect(browser.browserAction.setBadgeText).toHaveBeenCalledTimes(1)
  expect(browser.browserAction.setBadgeText).toHaveBeenCalledWith({ text: '2' })
  expect(store.data[CURRENT_LIVES]).toEqual(currentLivesThree)
  expect(store.data[ENDED_LIVES]).toEqual(endedLivesThree)
  expect(returnValueThree).toEqual(currentLivesThree)

  getCurrentLives.mockClear()
  browser.browserAction.setBadgeText.mockClear()

  // Fourth run
  const currentLivesFour = []
  const endedLivesFour = [
    endedLivesThree[0],
    {
      ...currentLivesThree[0],
      duration: dayjs.duration(3, 'hour').as('second'),
    },
    endedLivesThree[1],
    {
      ...currentLivesThree[1],
      duration: dayjs.duration(1, 'hour').as('second'),
    },
  ]

  getCurrentLives.mockResolvedValueOnce(currentLivesFour)

  const returnValueFour = await workflows.syncCurrentLives()

  expect(browser.browserAction.setBadgeText).toHaveBeenCalledTimes(1)
  expect(browser.browserAction.setBadgeText).toHaveBeenCalledWith({ text: '0' })
  expect(store.data[CURRENT_LIVES]).toEqual(currentLivesFour)
  expect(store.data[ENDED_LIVES]).toEqual(endedLivesFour)
  expect(returnValueFour).toEqual(currentLivesFour)
})

test('should get cached scheduled lives', async () => {
  const scheduledLives = [{ id: 1 }, { id: 2 }]

  expect(workflows.getCachedScheduledLives()).toEqual(undefined)

  await store.set({ [SCHEDULED_LIVES]: scheduledLives })

  expect(workflows.getCachedScheduledLives()).toEqual(scheduledLives)
})

test('should sync scheduled lives', async () => {
  Date.now = jest.fn(() => unixTime * 1000)
  const endedLives = [{ id: 1 }, { id: 2 }]

  getScheduledLives.mockResolvedValueOnce(endedLives)

  const returnValue = await workflows.syncScheduledLives()

  expect(getScheduledLives).toHaveBeenCalledWith({
    startBefore: getUnixAfterDays(7),
  })
  expect(store.data[SCHEDULED_LIVES]).toEqual(endedLives)
  expect(returnValue).toEqual(endedLives)
})

test('should get cached channels', async () => {
  const channels = [{ id: 1 }, { id: 2 }]

  expect(workflows.getCachedChannels()).toEqual(undefined)

  await store.set({ [CHANNELS]: channels })

  expect(workflows.getCachedChannels()).toEqual(channels)
})

test('should sync channels', async () => {
  const channels = [{ id: 1 }, { id: 2 }]

  getChannels.mockResolvedValue(channels)

  const returnValue = await workflows.syncChannels()

  expect(store.data[CHANNELS]).toEqual(channels)
  expect(returnValue).toEqual(channels)
})

test('should get subscriptionByMember', async () => {
  const subscriptionByMember = { 1: true, 2: false }

  expect(workflows.getSubscriptionByMember()).toEqual(undefined)

  await store.set({ [SUBSCRIPTION_BY_MEMBER]: subscriptionByMember })

  expect(workflows.getSubscriptionByMember()).toEqual(subscriptionByMember)
})

test('should set subscriptionByMember', async () => {
  const subscriptionByMemberOne = { 1: true, 2: false }
  const subscriptionByMemberTwo = { 1: false }

  expect(store.data[SUBSCRIPTION_BY_MEMBER]).toEqual(undefined)

  await workflows.setSubscriptionByMember(subscriptionByMemberOne)

  expect(store.data[SUBSCRIPTION_BY_MEMBER]).toEqual(subscriptionByMemberOne)

  await workflows.setSubscriptionByMember(subscriptionByMemberTwo)

  expect(store.data[SUBSCRIPTION_BY_MEMBER]).toEqual(subscriptionByMemberTwo)
})

test('should update subscriptionByMember', async () => {
  expect(store.data[SUBSCRIPTION_BY_MEMBER]).toEqual(undefined)

  await workflows.updateSubscriptionByMember(1, true)

  expect(store.data[SUBSCRIPTION_BY_MEMBER]).toEqual({ 1: true })

  await workflows.updateSubscriptionByMember(1, false)

  expect(store.data[SUBSCRIPTION_BY_MEMBER]).toEqual({ 1: false })

  await workflows.updateSubscriptionByMember(2, true)

  expect(store.data[SUBSCRIPTION_BY_MEMBER]).toEqual({ 1: false, 2: true })
})

test('should get cached members', async () => {
  const members = [{ id: 1 }, { id: 2 }]

  expect(workflows.getCachedMembers()).toEqual(undefined)

  await store.set({ [MEMBERS]: members })

  expect(workflows.getCachedMembers()).toEqual(members)
})

test('should sync members', async () => {
  const members = [{ id: 1 }, { id: 2 }]

  getMembers.mockResolvedValue(members)

  expect(workflows.getSubscriptionByMember()).toEqual(undefined)

  const returnValue = await workflows.syncMembers()

  expect(store.data[MEMBERS]).toEqual(members)
  expect(returnValue).toEqual(members)
  expect(workflows.getSubscriptionByMember()).toEqual({ 1: true, 2: true })
})

test('should get member info', async () => {
  const members = [{ id: 1, name: 'Member' }]
  const channels = [{ id: 1, member_id: 1 }, { id: 2, member_id: 1 }]
  const liveOne = { channel_id: 1 }
  const liveTwo = { channel_id: 2 }
  const liveThree = { channel_id: 3 }

  await store.set({ [MEMBERS]: members, [CHANNELS]: channels })

  expect(workflows.getMember(liveOne)).toEqual(members[0])
  expect(workflows.getMember(liveTwo)).toEqual(members[0])
  expect(workflows.getMember(liveThree)).toEqual({})
})

test('should toggle isNtfEnabled', async () => {
  await store.set({ [IS_NTF_ENABLED]: false })

  await workflows.toggleIsNtfEnabled()

  expect(store.data[IS_NTF_ENABLED]).toEqual(true)

  await workflows.toggleIsNtfEnabled()

  expect(store.data[IS_NTF_ENABLED]).toEqual(false)
})

test('should get locale', async () => {
  expect(workflows.getLocale()).toEqual(undefined)

  await store.set({ [LOCALE]: 'en' })

  expect(workflows.getLocale()).toEqual('en')
})

test('should set locale', async () => {
  expect(store.data[LOCALE]).toEqual(undefined)

  await workflows.setLocale('en')

  expect(store.data[LOCALE]).toEqual('en')

  await workflows.setLocale('zh-CN')

  expect(store.data[LOCALE]).toEqual('zh-CN')
})

test('should set isPopupFirstRun', async () => {
  expect(store.data[IS_POPUP_FIRST_RUN]).toEqual(undefined)

  await workflows.setIsPopupFirstRun(true)

  expect(store.data[IS_POPUP_FIRST_RUN]).toEqual(true)

  await workflows.setIsPopupFirstRun(false)

  expect(store.data[IS_POPUP_FIRST_RUN]).toEqual(false)
})

test('should toggle shouldSyncSettings', async () => {
  await store.set({ [SHOULD_SYNC_SETTINGS]: false })

  await workflows.toggleShouldSyncSettings()

  expect(store.data[SHOULD_SYNC_SETTINGS]).toEqual(true)

  await workflows.toggleShouldSyncSettings()

  expect(store.data[SHOULD_SYNC_SETTINGS]).toEqual(false)
})

test('should toggle is30HoursEnabled', async () => {
  await store.set({ [IS_30_HOURS_ENABLED]: false })

  await workflows.toggleIs30HoursEnabled()

  expect(store.data[IS_30_HOURS_ENABLED]).toEqual(true)

  await workflows.toggleIs30HoursEnabled()

  expect(store.data[IS_30_HOURS_ENABLED]).toEqual(false)
})

test('should set appearance', async () => {
  await store.set({ [APPEARANCE]: 'device' })

  await workflows.setAppearance('light')

  expect(store.data[APPEARANCE]).toEqual('light')
})
