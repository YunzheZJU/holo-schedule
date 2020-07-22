import moment from 'moment'
import notification from 'notification'
import { CHANNELS, MEMBERS } from 'shared/store/keys'
import store from 'store'
import alarm from './index'

jest.mock('notification')

test('should schedule and remove alarms', async () => {
  const live = { id: 0 }

  alarm.schedule(live)

  expect(alarm.isScheduled(live)).toBeTruthy()

  alarm.remove(live)

  expect(alarm.isScheduled(live)).toBeFalsy()
})

test('should subscribe to store', async () => {
  alarm.init(store)

  alarm.fire = jest.fn(alarm.fire)

  // Initialize
  await store.set({
    currentLives: [],
    scheduledLives: [],
  })

  // Add one guerrilla scheduled live and one normal scheduled live
  await store.set({
    currentLives: [],
    scheduledLives: [
      {
        id: 1,
        title: 'Title 1',
        start_at: moment().add(5, 'minutes').toISOString(),
      },
      {
        id: 2,
        title: 'Title 2',
        start_at: moment().add(15, 'minutes').toISOString(),
      },
    ],
  })
  expect(alarm.fire).toHaveBeenCalledTimes(1)
  alarm.fire.mockClear()

  // Go ahead 5 minutes
  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        start_at: moment().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        start_at: moment().add(5, 'minutes').toISOString(),
      },
    ],
  })
  expect(alarm.fire).toHaveBeenCalledTimes(0)
  alarm.fire.mockClear()

  // Add one guerrilla current live
  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        start_at: moment().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        start_at: moment().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        start_at: moment().add(5, 'minutes').toISOString(),
      },
    ],
  })
  expect(alarm.fire).toHaveBeenCalledTimes(1)
  alarm.fire.mockClear()
  expect(alarm.fire).toHaveBeenCalledTimes(0)

  // End one current live
  await store.set({
    currentLives: [
      {
        id: 3,
        title: 'Title 3',
        start_at: moment().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        start_at: moment().add(5, 'minutes').toISOString(),
      },
    ],
  })
  expect(alarm.fire).toHaveBeenCalledTimes(0)
  alarm.fire.mockClear()

  // Ended current live re-appear
  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        start_at: moment().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        start_at: moment().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        start_at: moment().add(5, 'minutes').toISOString(),
      },
    ],
  })
  expect(alarm.fire).toHaveBeenCalledTimes(0)
  alarm.fire.mockClear()

  // ABNORMAL: One current live becomes a guerrilla scheduled live
  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        start_at: moment().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        start_at: moment().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 2,
        title: 'Title 2',
        start_at: moment().add(5, 'minutes').toISOString(),
      },
    ],
  })
  expect(alarm.fire).toHaveBeenCalledTimes(0)
  alarm.fire.mockClear()

  // ABNORMAL: One current live becomes a guerrilla scheduled live and then starts
  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        start_at: moment().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        start_at: moment().toISOString(),
      },
      {
        id: 2,
        title: 'Title 2',
        start_at: moment().toISOString(),
      },
    ],
    scheduledLives: [],
  })
  expect(alarm.fire).toHaveBeenCalledTimes(0)
  alarm.fire.mockClear()

  // Add one scheduled live
  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        start_at: moment().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        start_at: moment().toISOString(),
      },
      {
        id: 2,
        title: 'Title 2',
        start_at: moment().toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 4,
        title: 'Title 4',
        start_at: moment().add(15, 'minutes').toISOString(),
      },
    ],
  })
  expect(alarm.fire).toHaveBeenCalledTimes(0)
  alarm.fire.mockClear()

  // Cancel one scheduled live
  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        start_at: moment().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        start_at: moment().toISOString(),
      },
      {
        id: 2,
        title: 'Title 2',
        start_at: moment().toISOString(),
      },
    ],
    scheduledLives: [],
  })
  expect(alarm.fire).toHaveBeenCalledTimes(0)
  alarm.fire.mockClear()

  // Cancelled scheduled live re-appear as a guerrilla
  await store.set({
    currentLives: [
      {
        id: 1,
        title: 'Title 1',
        start_at: moment().toISOString(),
      },
      {
        id: 3,
        title: 'Title 3',
        start_at: moment().toISOString(),
      },
      {
        id: 2,
        title: 'Title 2',
        start_at: moment().add(5, 'minutes').toISOString(),
      },
    ],
    scheduledLives: [
      {
        id: 4,
        title: 'Title 4',
        start_at: moment().add(5, 'minutes').toISOString(),
      },
    ],
  })
  expect(alarm.fire).toHaveBeenCalledTimes(0)
  alarm.fire.mockClear()
})

test('should fire scheduled alarms', async () => {
  alarm.init(store)

  alarm.fire = jest.fn(alarm.fire)

  // Initialize
  await store.set({
    currentLives: [],
    scheduledLives: [],
  })

  // Schedule a live and set up an alarm
  const live = {
    id: 0,
    title: 'Title',
    start_at: moment().add(15, 'minutes').toISOString(),
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
  expect(alarm.fire).toHaveBeenCalledTimes(1)

  expect(alarm.isScheduled(live)).toBeFalsy()
})

test('should create notification when firing alarms', async () => {
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

  expect(notification.create).toHaveBeenCalledTimes(1)
  expect(notification.create).toHaveBeenCalledWith(live.id.toString(), expect.objectContaining({
    title: live.title,
    message: `${members[0].name} is waiting for you`,
    iconUrl: members[0].avatar,
  }))
})
