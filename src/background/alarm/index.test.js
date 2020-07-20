import moment from 'moment'
import createStore from 'store/store'
import alarm from './index'

test('should schedule and remove', async () => {
  const live = { id: 0 }

  alarm.schedule(live)

  expect(alarm.isScheduled(live)).toBeTruthy()

  alarm.remove(live)

  expect(alarm.isScheduled(live)).toBeFalsy()
})

test('should subscribe to store', async () => {
  const store = createStore()
  await store.init()
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
