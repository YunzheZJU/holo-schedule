import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { clamp } from 'lodash'

const { min, max } = Math

dayjs.extend(isSameOrAfter)

const getUnixAfterDays = days => dayjs().add(days, 'day').unix()

const getUnixBeforeDays = days => getUnixAfterDays(-days)

const getUnix = input => dayjs(input).unix()

const isGuerrillaLive = live => dayjs(live['created_at'])
  .add(10, 'minute')
  .isSameOrAfter(dayjs(live['start_at']))

const normalize = (arrayOfObjects, ...keys) => keys.reduce((accu, key) => {
  const filteredValues = accu.map(({ [key]: value }) => value).map(Number).filter(Boolean)
  const minValue = min(...filteredValues)
  const maxValue = max(...filteredValues)
  return accu.map(object => ({
    ...object,
    [key]: (clamp(object[key], minValue, maxValue) - minValue) / (maxValue - minValue),
  }))
}, arrayOfObjects)

export {
  getUnixAfterDays,
  getUnixBeforeDays,
  getUnix,
  isGuerrillaLive,
  normalize,
}
