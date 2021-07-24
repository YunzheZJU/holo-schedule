import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { reverse, uniqBy } from 'lodash'

dayjs.extend(isSameOrAfter)

const getUnixAfterDays = days => dayjs().add(days, 'day').unix()

const getUnixBeforeDays = days => getUnixAfterDays(-days)

const getUnix = input => dayjs(input).unix()

const isGuerrillaLive = live => dayjs(live['created_at'])
  .add(10, 'minute')
  .isSameOrAfter(dayjs(live['start_at']))

const uniqRightBy = (array, ...args) => reverse(uniqBy(reverse([...array]), ...args))

export {
  getUnixAfterDays,
  getUnixBeforeDays,
  getUnix,
  isGuerrillaLive,
  uniqRightBy,
}
