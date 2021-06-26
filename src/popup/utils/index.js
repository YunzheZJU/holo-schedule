import dayjs from 'dayjs'
import { at, clamp, range } from 'lodash'

const { floor, min, max } = Math

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const formatDurationFromSeconds = (input = '0') => {
  const duration = +input
  const hours = floor(duration / 60 / 60)
  const minutes = floor((duration - hours * 60 * 60) / 60).toString().padStart(2, '0')
  const seconds = (duration - hours * 60 * 60 - minutes * 60).toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`.replace(/^0:0?/, '')
}

const normalize = (arrayOfObjects, ...keys) => keys.reduce((accu, key) => {
  const filteredValues = accu.map(({ [key]: value }) => value).filter(Boolean)
  const minValue = min(...filteredValues)
  const maxValue = max(...filteredValues)
  return accu.map(object => ({
    ...object,
    [key]: filteredValues.length
      ? ((clamp(object[key], minValue, maxValue) - minValue) / (maxValue - minValue))
      : 1,
  }))
}, arrayOfObjects)

const sampleHotnesses = (
  { hotnesses = [], start_at: startAt = '' }, samplesCount,
) => normalize(normalize(at(
  hotnesses, range(
    0, hotnesses.length - 0.1, max(1, hotnesses.length / samplesCount),
  ).map(floor),
).map(({ created_at: createdAt, like, watching }, index, records) => ({
  createdAt,
  timestamp: dayjs(createdAt).diff(startAt, 'second'),
  likeDelta: max((like ?? 0) - (records[max(index - 1, 0)]['like'] ?? 0), 0),
  watching,
})), 'timestamp', 'likeDelta', 'watching').map(
  ({ likeDelta, watching, ...fields }) => ({
    hotness: likeDelta * watching, ...fields,
  }),
), 'hotness').map(
  ({ timestamp, hotness, createdAt }) => [createdAt, [timestamp, hotness]],
)

export { sleep, formatDurationFromSeconds, sampleHotnesses }
