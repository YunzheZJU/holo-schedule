import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { max, min, range, reverse, uniqBy } from 'lodash'

dayjs.extend(isSameOrAfter)

const getUnixAfterDays = days => dayjs().add(days, 'day').unix()

const getUnixBeforeDays = days => getUnixAfterDays(-days)

const getUnix = input => dayjs(input).unix()

const isGuerrillaLive = live => dayjs(live['created_at'])
  .add(10, 'minute')
  .isSameOrAfter(dayjs(live['start_at']))

const uniqRightBy = (array, ...args) => reverse(uniqBy(reverse([...array]), ...args))

const getMemberMask = subscriptionByMember => (subscriptionByMember ? range(
  1, min([(max(Object.keys(subscriptionByMember).map(Number)) || 0) + 1, 256]),
).map(memberId => Number(subscriptionByMember[memberId] || false)).join('') : undefined)

export {
  getUnixAfterDays,
  getUnixBeforeDays,
  getUnix,
  isGuerrillaLive,
  uniqRightBy,
  getMemberMask,
}
