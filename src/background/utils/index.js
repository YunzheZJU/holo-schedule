import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(isSameOrAfter)

const getUnixAfterDays = days => dayjs().add(days, 'day').unix()

const getUnixBeforeDays = days => getUnixAfterDays(-days)

const getUnix = input => dayjs(input).unix()

const isGuerrillaLive = live => dayjs(live['created_at'])
  .add(10, 'minute')
  .isSameOrAfter(dayjs(live['start_at']))

export {
  getUnixAfterDays,
  getUnixBeforeDays,
  getUnix,
  isGuerrillaLive,
}
