import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
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
  LOCALE,
  MEMBERS,
  SCHEDULED_LIVES,
  SHOULD_SYNC_SETTINGS,
  SUBSCRIPTION_BY_MEMBER,
  LAST_SUCCESS_REQUEST_TIME,
} from 'shared/store/keys'
import store from 'store'
import { getUnix, getUnixAfterDays, getUnixBeforeDays } from 'utils'
import workflows from './workflows'

dayjs.extend(duration)

jest.mock('requests')
const unixTime = Math.floor(Date.now() / 1000)

beforeEach(() => {
  // eslint-disable-next-line no-restricted-syntax
  for (const prop of Object.getOwnPropertyNames(store.data)) {
    delete store.data[prop]
  }
  browser.action = browser.browserAction
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

test('should extract title', async () => {
  expect(workflows.extractTopic({ title: '' })).toEqual('')
  expect(workflows.extractTopic({ title: 'Title' })).toEqual('')
  expect(workflows.extractTopic({ title: '[Topic]Title' })).toEqual('Topic')
  expect(workflows.extractTopic({ title: '【Topic】Title' })).toEqual('Topic')
  expect(workflows.extractTopic({ title: '「Topic」Title' })).toEqual('Topic')
  expect(workflows.extractTopic({ title: '《Topic》Title' })).toEqual('Topic')
  expect(workflows.extractTopic({ title: '≪Topic≫Title' })).toEqual('Topic')
  expect(workflows.extractTopic({ title: '【Topic】【Title】' })).toEqual('Topic')
  expect(workflows.extractTopic({ title: '【Top]ic】Title' })).toEqual('Top')
})

test('should sort lives', async () => {
  const members = [{ id: 1 }, { id: 2 }]
  const channels = [
    { id: 1, member_id: 1 },
    { id: 2, member_id: 2 },
  ]
  const liveOne = {
    id: 1,
    title: '【主题】标题',
    start_at: dayjs().subtract(2, 'hour').toISOString(),
    channel_id: 2,
  }
  const liveTwo = {
    ...liveOne,
    id: 2,
    start_at: dayjs().subtract(3, 'hour').toISOString(),
  }
  const liveThree = {
    ...liveOne,
    id: 3,
    title: '【游戏】标题',
  }
  const liveFour = {
    ...liveOne,
    id: 4,
    title: '标题',
  }
  const liveFive = {
    ...liveOne,
    id: 5,
    channel_id: 1,
  }
  const liveSix = {
    ...liveOne,
    id: 6,
    channel_id: 2,
  }

  await store.set({
    [MEMBERS]: members,
    [CHANNELS]: channels,
  })

  const livesToSort = [liveFour, liveThree, liveSix, liveOne, liveTwo, liveFive]
  const livesExpected = [liveTwo, liveFive, liveOne, liveSix, liveThree, liveFour]

  const sortedLives = workflows.sortLives(livesToSort)

  expect(sortedLives).toEqual(livesExpected)
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
  const members = [{ id: 1 }]
  const channels = [
    { id: 1, member_id: 1 },
  ]

  await store.set({
    [MEMBERS]: members,
    [CHANNELS]: channels,
  })

  Date.now = jest.fn(() => unixTime * 1000)
  // First run
  const endedLivesOne = [
    { id: 10, start_at: dayjs().subtract(3, 'hour').toISOString(), title: '', channel_id: 1 },
    { id: 9, start_at: dayjs().subtract(4, 'hour').toISOString(), title: '', channel_id: 1 },
  ]
  const returnValueExpectedOne = [endedLivesOne[1], endedLivesOne[0]]

  getEndedLives.mockResolvedValueOnce(endedLivesOne)

  const returnValueOne = await workflows.syncEndedLives()

  expect(getEndedLives).toHaveBeenCalledWith({
    startAfter: getUnixBeforeDays(3),
    startBefore: getUnix(),
    limit: 25,
  })
  expect(store.data[ENDED_LIVES]).toEqual(returnValueExpectedOne)
  expect(returnValueOne).toEqual(returnValueExpectedOne)
  // Second run
  getEndedLives.mockClear()
  const endedLivesTwo = [
    endedLivesOne[1],
    { id: 8, start_at: dayjs().subtract(5, 'hour').toISOString(), title: '', channel_id: 1 },
  ]
  const returnValueExpectedTwo = [endedLivesTwo[1], ...returnValueExpectedOne]

  getEndedLives.mockResolvedValueOnce(endedLivesTwo)

  const returnValueTwo = await workflows.syncEndedLives()

  expect(getEndedLives).toHaveBeenCalledWith({
    startAfter: getUnixBeforeDays(3),
    startBefore: getUnix(returnValueExpectedOne[0].start_at) + 1,
    limit: 25,
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
    limit: 25,
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

test('should get cached scheduled lives', async () => {
  const scheduledLives = [{ id: 1 }, { id: 2 }]

  expect(workflows.getCachedScheduledLives()).toEqual(undefined)

  await store.set({ [SCHEDULED_LIVES]: scheduledLives })

  expect(workflows.getCachedScheduledLives()).toEqual(scheduledLives)
})

test('should sync open lives', async () => {
  Date.now = jest.fn(() => unixTime * 1000)

  // First run
  const currentLivesOne = [
    {
      id: 1,
      title: '1',
      start_at: dayjs().subtract(3, 'hour').toISOString(),
      duration: null,
    },
    {
      id: 2,
      title: '2',
      start_at: dayjs().subtract(3, 'hour').toISOString(),
      duration: null,
    },
    {
      id: 3,
      title: '3',
      start_at: dayjs().subtract(2, 'hour').toISOString(),
      duration: null,
    },
  ]
  const scheduledLivesOne = [
    {
      id: 4,
      title: '4',
      start_at: dayjs().add(1, 'hour').toISOString(),
      duration: null,
    },
    {
      id: 5,
      title: '5',
      start_at: dayjs().add(2, 'hour').toISOString(),
      duration: null,
    },
  ]
  const openLivesOne = [...currentLivesOne, ...scheduledLivesOne]
  const endedLivesOne = []

  getOpenLives.mockResolvedValueOnce(openLivesOne)

  const returnValueOne = await workflows.syncOpenLives()

  expect(getOpenLives).toHaveBeenCalledWith({
    limit: 100,
    membersMask: undefined,
    startBefore: getUnixAfterDays(7),
  })
  expect(browser.browserAction.setBadgeText).toHaveBeenCalledTimes(1)
  expect(browser.browserAction.setBadgeText).toHaveBeenCalledWith({ text: '3' })
  expect(store.data[CURRENT_LIVES]).toEqual(currentLivesOne)
  expect(store.data[SCHEDULED_LIVES]).toEqual(scheduledLivesOne)
  expect(store.data[ENDED_LIVES]).toEqual(endedLivesOne)
  expect(returnValueOne).toEqual(openLivesOne)

  getOpenLives.mockClear()
  browser.browserAction.setBadgeText.mockClear()

  // Second run
  const currentLivesTwo = [
    openLivesOne[1],
    openLivesOne[2],
    {
      ...scheduledLivesOne[0],
      start_at: dayjs().subtract(1, 'hour').toISOString(),
    },
  ]
  const scheduledLivesTwo = [
    scheduledLivesOne[1],
  ]
  const openLivesTwo = [...currentLivesTwo, ...scheduledLivesTwo]
  const endedLivesTwo = [
    {
      ...openLivesOne[0],
      duration: dayjs.duration(3, 'hour').as('second'),
    },
  ]

  getOpenLives.mockResolvedValueOnce(openLivesTwo)

  const returnValueTwo = await workflows.syncOpenLives()

  expect(browser.browserAction.setBadgeText).toHaveBeenCalledTimes(1)
  expect(browser.browserAction.setBadgeText).toHaveBeenCalledWith({ text: '3' })
  expect(store.data[SCHEDULED_LIVES]).toEqual(scheduledLivesTwo)
  expect(store.data[CURRENT_LIVES]).toEqual(currentLivesTwo)
  expect(store.data[ENDED_LIVES]).toEqual([])
  expect(returnValueTwo).toEqual(openLivesTwo)

  getOpenLives.mockClear()
  browser.browserAction.setBadgeText.mockClear()

  // Second run second
  await store.set({ [ENDED_LIVES]: endedLivesTwo })

  getOpenLives.mockResolvedValueOnce(openLivesTwo)

  const returnValueTwoSecond = await workflows.syncOpenLives()

  expect(browser.browserAction.setBadgeText).toHaveBeenCalledTimes(1)
  expect(browser.browserAction.setBadgeText).toHaveBeenCalledWith({ text: '3' })
  expect(store.data[SCHEDULED_LIVES]).toEqual(scheduledLivesTwo)
  expect(store.data[CURRENT_LIVES]).toEqual(currentLivesTwo)
  expect(store.data[ENDED_LIVES]).toEqual(endedLivesTwo)
  expect(returnValueTwoSecond).toEqual(openLivesTwo)

  getOpenLives.mockClear()
  browser.browserAction.setBadgeText.mockClear()

  // Third run
  const currentLivesThree = [
    { ...endedLivesTwo[0], duration: null },
    openLivesTwo[0],
    openLivesTwo[2],
  ]
  const scheduledLivesThree = []
  const openLivesThree = [...currentLivesThree, ...scheduledLivesThree]
  const endedLivesThree = [
    endedLivesTwo[0],
    {
      ...openLivesOne[2],
      duration: dayjs.duration(2, 'hour').as('second'),
    },
  ]

  getOpenLives.mockResolvedValueOnce(openLivesThree)

  const returnValueThree = await workflows.syncOpenLives()

  expect(browser.browserAction.setBadgeText).toHaveBeenCalledTimes(1)
  expect(browser.browserAction.setBadgeText).toHaveBeenCalledWith({ text: '3' })
  expect(store.data[CURRENT_LIVES]).toEqual(currentLivesThree)
  expect(store.data[SCHEDULED_LIVES]).toEqual(scheduledLivesThree)
  expect(store.data[ENDED_LIVES]).toEqual(endedLivesThree)
  expect(returnValueThree).toEqual(openLivesThree)

  getOpenLives.mockClear()
  browser.browserAction.setBadgeText.mockClear()

  // Fourth run
  const currentLivesFour = []
  const scheduledLivesFour = []
  const openLivesFour = [...currentLivesFour, ...scheduledLivesFour]
  const endedLivesFour = [
    endedLivesThree[0],
    {
      ...openLivesThree[1],
      duration: dayjs.duration(3, 'hour').as('second'),
    },
    endedLivesThree[1],
    {
      ...openLivesThree[2],
      duration: dayjs.duration(1, 'hour').as('second'),
    },
  ]

  getOpenLives.mockResolvedValueOnce(openLivesFour)

  const returnValueFour = await workflows.syncOpenLives()

  expect(browser.browserAction.setBadgeText).toHaveBeenCalledTimes(1)
  expect(browser.browserAction.setBadgeText).toHaveBeenCalledWith({ text: '0' })
  expect(store.data[CURRENT_LIVES]).toEqual(currentLivesFour)
  expect(store.data[SCHEDULED_LIVES]).toEqual(scheduledLivesFour)
  expect(store.data[ENDED_LIVES]).toEqual(endedLivesFour)
  expect(returnValueFour).toEqual(openLivesFour)
})

test('should sync hotnesses', async () => {
  Date.now = jest.fn(() => unixTime * 1000)

  const endedLivesOne = [
    { id: 1, hotnesses: [{ watching: 1 }] }, { id: 2 }, { id: 3 },
  ]
  const hotnessesOne = [
    { live_id: 1, watching: 2 },
    { live_id: 2, watching: 1 },
    { live_id: 2, watching: 1 },
    { live_id: 4, watching: 1 },
  ]
  await store.set({ [ENDED_LIVES]: endedLivesOne })

  getHotnessesOfLives.mockResolvedValueOnce(hotnessesOne)

  await workflows.syncHotnesses(endedLivesOne)

  expect(store.data[ENDED_LIVES]).toEqual([
    { id: 1, hotnesses: [hotnessesOne[0]] },
    { id: 2, hotnesses: [hotnessesOne[1], hotnessesOne[2]] },
    { id: 3 },
  ])
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

  await store.set({ [ENDED_LIVES]: [1] })
  await workflows.updateSubscriptionByMember(1, true)

  expect(store.data[SUBSCRIPTION_BY_MEMBER]).toEqual({ 1: true })
  expect(store.data[ENDED_LIVES]).toEqual([])

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

test('should set isNtfEnabled', async () => {
  await store.set({ [IS_NTF_ENABLED]: false })

  await workflows.setIsNtfEnabled(true)

  expect(store.data[IS_NTF_ENABLED]).toEqual(true)

  await workflows.setIsNtfEnabled(false)

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

test('should set shouldSyncSettings', async () => {
  await store.set({ [SHOULD_SYNC_SETTINGS]: false })

  await workflows.setShouldSyncSettings(true)

  expect(store.data[SHOULD_SYNC_SETTINGS]).toEqual(true)

  await workflows.setShouldSyncSettings(false)

  expect(store.data[SHOULD_SYNC_SETTINGS]).toEqual(false)
})

test('should set is30HoursEnabled', async () => {
  await store.set({ [IS_30_HOURS_ENABLED]: false })

  await workflows.setIs30HoursEnabled(true)

  expect(store.data[IS_30_HOURS_ENABLED]).toEqual(true)

  await workflows.setIs30HoursEnabled(false)

  expect(store.data[IS_30_HOURS_ENABLED]).toEqual(false)
})

test('should set appearance', async () => {
  await store.set({ [APPEARANCE]: 'device' })

  await workflows.setAppearance('light')

  expect(store.data[APPEARANCE]).toEqual('light')
})

test('should get lastSuccessRequestTime', async () => {
  expect(workflows.getLastSuccessRequestTime()).toEqual(undefined)

  await store.set({ [LAST_SUCCESS_REQUEST_TIME]: 100 })

  expect(workflows.getLastSuccessRequestTime()).toEqual(100)
})

test('should set lastSuccessRequestTime', async () => {
  expect(store.data[LAST_SUCCESS_REQUEST_TIME]).toEqual(undefined)

  await workflows.setLastSuccessRequestTime(100)

  expect(store.data[LAST_SUCCESS_REQUEST_TIME]).toEqual(100)

  await workflows.setLastSuccessRequestTime(200)

  expect(store.data[LAST_SUCCESS_REQUEST_TIME]).toEqual(200)
})
