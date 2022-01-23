import dayjs from 'dayjs'
import i18n from 'i18n'
import notification from 'notification'
import { CHANNELS, IS_NTF_ENABLED, MEMBERS } from 'shared/store/keys'
import store from 'store'
import alarm from './index'

jest.mock('notification')

beforeEach(async () => {
  // eslint-disable-next-line no-restricted-syntax
  for (const prop of Object.getOwnPropertyNames(store.data)) {
    delete store.data[prop]
  }
  store.callbacks.length = 0

  await store.set({
    currentLives: [],
    scheduledLives: [],
  })
  await alarm.init(store)
})

afterEach(() => {
  notification.create.mockClear()
})

test('should schedule and remove alarms', async () => {
  const live = { id: 0 }

  alarm.schedule(live)

  expect(alarm.isScheduled(live)).toBeTruthy()

  alarm.remove(live)

  expect(alarm.isScheduled(live)).toBeFalsy()
})

test('Add one guerrilla scheduled live and one normal scheduled live and Go ahead 5 minutes', async () => {
  // Initialize
  await store.set({
    currentLives: [],
    scheduledLives: [],
  })
  notification.create.mockClear()

  await store.set({
    currentLives: [],
    scheduledLives: [
      {
        id: 1,
        title: 'Title 1',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
      {
        id: 2,
        title: 'Title 2',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(15, 'minute').toISOString(),
      },
    ],
  })
  expect(notification.create).toHaveBeenCalledTimes(1)
  notification.create.mockClear()

  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
    ],
  })
  expect(notification.create).toHaveBeenCalledTimes(0)
})

test('Add one guerrilla current live', async () => {
  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
    ],
  })
  notification.create.mockClear()

  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
    ],
  })
  expect(notification.create).toHaveBeenCalledTimes(1)
})

test('End one current live and Ended current live re-appear', async () => {
  // Add one guerrilla current live
  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
    ],
  })
  notification.create.mockClear()

  await store.set({
    currentLives: [
      {
        id: 3,
        title: 'Title 3',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
    ],
  })
  expect(notification.create).toHaveBeenCalledTimes(0)
  notification.create.mockClear()

  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
    ],
  })
  expect(notification.create).toHaveBeenCalledTimes(0)
})

test('ABNORMAL: One current live becomes a guerrilla scheduled live and then starts', async () => {
  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
    ],
  })
  notification.create.mockClear()

  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
    ],
  })
  expect(notification.create).toHaveBeenCalledTimes(0)
  notification.create.mockClear()

  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
    ],
  })
  expect(notification.create).toHaveBeenCalledTimes(0)
})

test('Add one scheduled live', async () => {
  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
    ],
  })
  notification.create.mockClear()

  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
      {
        id: 4,
        title: 'Title 4',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(15, 'minute').toISOString(),
      },
    ],
  })
  expect(notification.create).toHaveBeenCalledTimes(0)
})

test('Cancelled scheduled live re-appear as a guerrilla, twice', async () => {
  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
      {
        id: 4,
        title: 'Title 4',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(15, 'minute').toISOString(),
      },
    ],
  })
  notification.create.mockClear()

  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
    ],
  })
  expect(notification.create).toHaveBeenCalledTimes(0)
  notification.create.mockClear()

  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
      {
        id: 4,
        title: 'Title 4',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
    ],
  })
  expect(notification.create).toHaveBeenCalledTimes(1)
  notification.create.mockClear()

  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
    ],
  })
  expect(notification.create).toHaveBeenCalledTimes(0)
  notification.create.mockClear()

  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
      {
        id: 4,
        title: 'Title 4',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
    ],
  })
  expect(notification.create).toHaveBeenCalledTimes(0)
})

test('Three current lives including a guerrilla exist during the system\'s sleep', async () => {
  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
      {
        id: 2,
        title: 'Title 2',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 4,
        title: 'Title 4',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
    ],
  })
  notification.create.mockClear()

  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        created_at: dayjs().toISOString(),
        start_at: dayjs().toISOString(),
      },
      {
        id: 2,
        title: 'Title 2',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
      {
        id: 4,
        title: 'Title 4',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
      {
        id: 5,
        title: 'Title 5',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(5, 'minute').toISOString(),
      },
      {
        id: 6,
        title: 'Title 6',
        created_at: dayjs().toISOString(),
        start_at: dayjs().add(15, 'minute').toISOString(),
      },
      {
        id: 7,
        title: 'Title 7',
        created_at: dayjs().subtract(5, 'minute').toISOString(),
        start_at: dayjs().subtract(4, 'minute').toISOString(),
      },
    ],
    scheduledLives: [],
  })
  expect(notification.create).toHaveBeenCalledTimes(1)
})

test('should fire scheduled alarms', async () => {
  await alarm.init(store)

  notification.create = jest.fn(notification.create)

  // Initialize
  await store.set({
    currentLives: [],
    scheduledLives: [],
  })

  // Schedule a live and set up an alarm
  const live = {
    id: 0,
    title: 'Title',
    created_at: dayjs().toISOString(),
    start_at: dayjs().add(15, 'minute').toISOString(),
  }
  await store.set({
    currentLives: [],
    scheduledLives: [live],
  })
  alarm.schedule(live)
  expect(alarm.isScheduled(live)).toBeTruthy()

  // The scheduled live has started
  await store.set({
    currentLives: [live],
    scheduledLives: [],
  })
  expect(notification.create).toHaveBeenCalledTimes(1)

  expect(alarm.isScheduled(live)).toBeFalsy()
})

test('should create notification when firing alarms', async () => {
  await alarm.init(store)

  const members = [{
    id: 1,
    name: 'Member 1',
    avatar: 'https://example.com',
  }, {
    id: 2,
    name: 'Member 2',
    avatar: 'https://example.com',
  }]
  const channels = [{ id: 1, member_id: 1 }, { id: 2, member_id: 2 }]
  const liveReminder = {
    id: 1,
    platform: 'youtube',
    title: 'Title 1',
    channel_id: 1,
    room: 'Room 1',
    start_at: dayjs().subtract(5, 'minute').toISOString(),
  }
  const liveGuerrilla = {
    id: 2,
    platform: 'youtube',
    title: 'Title 2',
    channel_id: 2,
    room: 'Room 2',
    start_at: dayjs().add(5, 'minute').toISOString(),
  }

  await store.set({ [MEMBERS]: members, [CHANNELS]: channels })
  notification.create = jest.fn()

  alarm.fire(liveReminder)
  alarm.fire(liveGuerrilla, true)

  expect(notification.create).toHaveBeenCalledTimes(2)
  expect(notification.create).toHaveBeenNthCalledWith(
    1,
    liveReminder.id.toString(),
    expect.objectContaining({
      title: liveReminder.title,
      message: i18n.getMessage('notification.reminder', { name: members[0].name }),
      iconUrl: members[0].avatar,
    }),
  )
  expect(notification.create).toHaveBeenNthCalledWith(
    2,
    liveGuerrilla.id.toString(),
    expect.objectContaining({
      title: liveGuerrilla.title,
      message: i18n.getMessage('notification.guerrilla', { name: members[1].name }),
      iconUrl: members[1].avatar,
    }),
  )
})

test('should get is notification enabled', async () => {
  // For single test
  alarm.$store = store

  alarm.$defaultIsNtfEnabled = false
  await store.set({ [IS_NTF_ENABLED]: undefined })

  expect(alarm.getIsNtfEnabled()).toEqual(false)

  alarm.$defaultIsNtfEnabled = true
  await store.set({ [IS_NTF_ENABLED]: undefined })

  expect(alarm.getIsNtfEnabled()).toEqual(true)

  alarm.$defaultIsNtfEnabled = false
  await store.set({ [IS_NTF_ENABLED]: false })

  expect(alarm.getIsNtfEnabled()).toEqual(false)

  alarm.$defaultIsNtfEnabled = true
  await store.set({ [IS_NTF_ENABLED]: false })

  expect(alarm.getIsNtfEnabled()).toEqual(false)

  alarm.$defaultIsNtfEnabled = false
  await store.set({ [IS_NTF_ENABLED]: true })

  expect(alarm.getIsNtfEnabled()).toEqual(true)

  alarm.$defaultIsNtfEnabled = true
  await store.set({ [IS_NTF_ENABLED]: true })

  expect(alarm.getIsNtfEnabled()).toEqual(true)
})

test('should not create notification when alarm is disabled', async () => {
  alarm.getIsNtfEnabled = jest.fn(() => false)

  const members = [{ id: 1, name: 'Member', avatar: 'https://example.com' }]
  const channels = [{ id: 1, member_id: 1 }]
  const live = {
    id: 1,
    platform: 'youtube',
    title: 'Title',
    channel_id: 1,
    room: 'Room',
  }

  await store.set({ [MEMBERS]: members, [CHANNELS]: channels })
  notification.create = jest.fn()

  alarm.fire(live)

  expect(notification.create).toHaveBeenCalledTimes(0)
})
