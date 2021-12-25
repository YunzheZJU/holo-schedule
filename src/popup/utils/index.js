import dayjs from 'dayjs'
import { at, clamp, range } from 'lodash'

const { floor, min, max, round } = Math

const sleep = ms => new Promise(resolve => {
  setTimeout(resolve, ms)
})

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

const sampleHotnesses = ({ hotnesses = [], start_at: startAt = '' }, maxSamplesCount) => {
  const samplesToNormalize = at(
    hotnesses, range(
      0, hotnesses.length - 0.1, max(1, hotnesses.length / maxSamplesCount),
    ).map(floor),
  ).reduce(
    ({ arr, continuous, prevLike }, { like, ...value }) => {
      const lk = like === null ? prevLike : like
      const cnt = like === null ? continuous + 1 : 1
      return {
        arr: [...arr, { like: lk, continuous: cnt, ...value }], prevLike: lk, continuous: cnt,
      }
    }, { arr: [], continuous: 1, prevLike: null },
  ).arr.reduceRight(({ arr, maxContinuous, currentCounter, nextLike }, {
    continuous, created_at: createdAt, watching, like,
  }) => {
    const isContinuous = continuous !== 1 || currentCounter === 1
    const mContinuous = isContinuous ? max(maxContinuous, continuous) : continuous
    return {
      arr: [...arr, {
        likeDelta: round(max(
          ((nextLike ?? like) - (like ?? nextLike)) / max(mContinuous, continuous), 0,
        )),
        timestamp: dayjs(createdAt).diff(startAt, 'second'),
        watching,
        createdAt,
      }],
      maxContinuous: mContinuous,
      // eslint-disable-next-line
      currentCounter: isContinuous ? (currentCounter === 0 ? continuous - 1 : currentCounter - 1) : 0,
      nextLike: continuous !== 1 ? nextLike : like,
    }
  }, { arr: [], maxContinuous: 1, currentCounter: 0, nextLike: null }).arr.reverse()
  return normalize(normalize(samplesToNormalize, 'timestamp', 'likeDelta', 'watching').map(
    ({ likeDelta, watching, ...fields }) => ({ hotness: likeDelta * watching, ...fields }),
  ), 'hotness').map(
    ({ timestamp, hotness, createdAt }) => [createdAt, [timestamp, hotness]],
  )
}

export { sleep, formatDurationFromSeconds, normalize, sampleHotnesses }
