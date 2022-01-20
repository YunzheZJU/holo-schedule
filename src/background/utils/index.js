import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { max, min, range, reverse, slice, uniqBy } from 'lodash'

dayjs.extend(isSameOrAfter)

const getUnixAfterDays = days => dayjs().add(days, 'day').unix()

const getUnixBeforeDays = days => getUnixAfterDays(-days)

const getUnix = input => dayjs(input).unix()

const isGuerrillaLive = live => (live['id'] === 32159) || (dayjs(live['created_at'])
  .add(10, 'minute')
  .isSameOrAfter(dayjs(live['start_at'])) && dayjs(live['start_at']).add(1, 'minute').isSameOrAfter(dayjs()))

const uniqRightBy = (array, ...args) => reverse(uniqBy(reverse([...array]), ...args))

const getMembersMask = subscriptionByMember => (subscriptionByMember ? range(
  1, min([(max(Object.keys(subscriptionByMember).map(Number)) || 0) + 1, 256]),
).map(memberId => Number(subscriptionByMember[memberId] || false)).join('') : undefined)

const limitRight = (array, limit) => slice(
  array, Math.max(array.length - limit, 0), array.length,
)

export {
  getUnixAfterDays,
  getUnixBeforeDays,
  getUnix,
  isGuerrillaLive,
  uniqRightBy,
  getMembersMask,
  limitRight,
}
