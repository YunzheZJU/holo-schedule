import { reverse, uniqBy } from 'lodash'
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
import workflows from './index'

jest.mock('requests')
const unixTime = Math.floor(Date.now() / 1000)

beforeEach(() => {
  store.data = {}
})

test('should filter lives by title', () => {
  const livesToFilter = [
    { platform: 'bilibili', title: '标题' },
    { platform: 'bilibili', title: '【B限】标题' },
    { platform: 'bilibili', title: '【B站限定】' },
    { platform: 'bilibili', title: '【Bilibili限定】' },
    { platform: 'bilibili', title: '【b限】标题' },
    { platform: 'bilibili', title: '【b站限定】' },
    { platform: 'bilibili', title: '【bilibili限定】' },
    { platform: 'youtube', title: '标题' },
    { platform: 'youtube', title: '【B限】标题' },
    { platform: 'youtube', title: '【B站限定】' },
    { platform: 'youtube', title: '【Bilibili限定】' },
  ]
  const livesExpected = [
    { platform: 'bilibili', title: '【B限】标题' },
    { platform: 'bilibili', title: '【B站限定】' },
    { platform: 'bilibili', title: '【Bilibili限定】' },
    { platform: 'bilibili', title: '【b限】标题' },
    { platform: 'bilibili', title: '【b站限定】' },
    { platform: 'bilibili', title: '【bilibili限定】' },
    { platform: 'youtube', title: '标题' },
    { platform: 'youtube', title: '【B限】标题' },
    { platform: 'youtube', title: '【B站限定】' },
    { platform: 'youtube', title: '【Bilibili限定】' },
  ]

  const filteredLives = workflows.filterByTitle(livesToFilter)

  expect(filteredLives).toEqual(livesExpected)
})

test('should get cached ended lives', async () => {
  const endedLives = [{ id: 1 }, { id: 2 }]

  expect(workflows.getCachedEndedLives()).toEqual(undefined)

  await store.set({ [ENDED_LIVES]: endedLives })

  expect(workflows.getCachedEndedLives()).toEqual(endedLives)
})

test('should sync ended lives', async () => {
  Date.now = jest.fn(() => unixTime * 1000)
  // First run
  const endedLivesOne = [
    { id: 10, start_at: moment().subtract(3, 'hours').toISOString() },
    { id: 9, start_at: moment().subtract(4, 'hours').toISOString() },
  ]
  const returnValueExpectedOne = reverse([...endedLivesOne])

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
    { id: 9, start_at: moment().subtract(4, 'hours').toISOString() },
    { id: 8, start_at: moment().subtract(5, 'hours').toISOString() },
  ]
  const returnValueExpectedTwo = uniqBy([...reverse([...endedLivesTwo]), ...returnValueExpectedOne], 'id')

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
      start_at: moment().subtract(3, 'hours').toISOString(),
      duration: 0,
    },
    {
      id: 2,
      start_at: moment().subtract(2, 'hours').toISOString(),
      duration: 0,
    },
  ]
  getCurrentLives.mockResolvedValueOnce(currentLivesOne)

  const returnValueOne = await workflows.syncCurrentLives()

  expect(browser.browserAction.setBadgeText).toHaveBeenCalledTimes(1)
  expect(browser.browserAction.setBadgeText).toHaveBeenCalledWith({ text: '2' })
  expect(store.data[CURRENT_LIVES]).toEqual(currentLivesOne)
  expect(store.data[ENDED_LIVES]).toEqual(undefined)
  expect(returnValueOne).toEqual(currentLivesOne)
  // Second run
  getCurrentLives.mockClear()
  browser.browserAction.setBadgeText.mockClear()
  const currentLivesTwo = [
    currentLivesOne[1],
    {
      id: 3,
      start_at: moment().subtract(1, 'hours').toISOString(),
      duration: 0,
    },
  ]
  getCurrentLives.mockResolvedValueOnce(currentLivesTwo)

  const returnValueTwo = await workflows.syncCurrentLives()

  expect(browser.browserAction.setBadgeText).toHaveBeenCalledTimes(1)
  expect(browser.browserAction.setBadgeText).toHaveBeenCalledWith({ text: '2' })
  expect(store.data[CURRENT_LIVES]).toEqual(currentLivesTwo)
  expect(store.data[ENDED_LIVES]).toEqual([
    {
      ...currentLivesOne[0],
      duration: moment.duration(3, 'hours').as('seconds'),
    },
  ])
  expect(returnValueTwo).toEqual(currentLivesTwo)
  // Third run
  getCurrentLives.mockClear()
  browser.browserAction.setBadgeText.mockClear()
  const currentLivesThree = []
  getCurrentLives.mockResolvedValueOnce(currentLivesThree)

  const returnValueThree = await workflows.syncCurrentLives()

  expect(browser.browserAction.setBadgeText).toHaveBeenCalledTimes(1)
  expect(browser.browserAction.setBadgeText).toHaveBeenCalledWith({ text: '0' })
  expect(store.data[CURRENT_LIVES]).toEqual(currentLivesThree)
  expect(store.data[ENDED_LIVES]).toEqual([
    {
      ...currentLivesOne[0],
      duration: moment.duration(3, 'hours').as('seconds'),
    },
    {
      ...currentLivesOne[1],
      duration: moment.duration(2, 'hours').as('seconds'),
    }, {
      ...currentLivesTwo[1],
      duration: moment.duration(1, 'hours').as('seconds'),
    },
  ])
  expect(returnValueThree).toEqual(currentLivesThree)
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

test('should get cached members', async () => {
  const members = [{ id: 1 }, { id: 2 }]

  expect(workflows.getCachedMembers()).toEqual(undefined)

  await store.set({ [MEMBERS]: members })

  expect(workflows.getCachedMembers()).toEqual(members)
})

test('should sync members', async () => {
  const members = [{ id: 1 }, { id: 2 }]

  getMembers.mockResolvedValue(members)

  const returnValue = await workflows.syncMembers()

  expect(store.data[MEMBERS]).toEqual(members)
  expect(returnValue).toEqual(members)
})

test('should get member info', async () => {
  const members = [{ id: 1, name: 'Member' }]
  const channels = [{ id: 1, member_id: 1 }, { id: 1, member_id: 1 }]
  const liveOne = { channel_id: 1 }
  const liveTwo = { channel_id: 2 }
  const liveThree = { channel_id: 3 }

  await store.set({ [MEMBERS]: members, [CHANNELS]: channels })

  expect(workflows.getMember(liveOne)).toEqual(members[0])
  expect(workflows.getMember(liveTwo)).toEqual({})
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
