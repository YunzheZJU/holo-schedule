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
    [key]: filteredValues.length && minValue !== maxValue
      ? ((clamp(object[key], minValue, maxValue) - minValue) / (maxValue - minValue))
      : 1,
  }))
}, arrayOfObjects)

const sampleHotnesses = (
  { hotnesses = [], start_at: startAt = '' }, maxSamplesCount,
) => {
  const a = at(
    hotnesses, range(
      0, hotnesses.length - 0.1, max(1, hotnesses.length / maxSamplesCount),
    ).map(floor),
  ).reduce(
    ({ accu, nullCount, lastValid }, { like, ...value }) => {
      const newLike = like === null ? lastValid : like
      return {
        accu: [...accu, { like: newLike, ...value }],
        nullCount: like === null ? nullCount + 1 : 1,
        lastValid: newLike,
      }
    }, { accu: [], nullCount: 1, lastValid: null },
  ).accu.reduceRight(
    ({ accu, lastValid }, { like, nullCount, created_at: createdAt, watching }) => ({
      accu: [...accu, {
        likeDelta: max(((lastValid ?? like) - (like ?? lastValid)) / nullCount, 0),
        timestamp: dayjs(createdAt).diff(startAt, 'second'),
        watching,
        createdAt,
      }],
      lastValid: nullCount === 1 ? like : lastValid,
    }), { accu: [], lastValid: null },
  ).accu.reverse()
  return normalize(normalize(a, 'timestamp', 'likeDelta', 'watching').map(
    ({ likeDelta, watching, ...fields }) => ({
      hotness: likeDelta * watching, ...fields,
    }),
  ), 'hotness').map(
    ({ timestamp, hotness, createdAt }) => [createdAt, [timestamp, hotness]],
  )
}

export { sleep, formatDurationFromSeconds, normalize, sampleHotnesses }
