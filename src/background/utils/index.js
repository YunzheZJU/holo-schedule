import moment from 'moment'

const getUnixAfterDays = days => moment().add(days, 'days').unix()

const getUnixBeforeDays = days => getUnixAfterDays(-days)

const getUnix = input => moment(input).unix()

const isGuerrillaLive = live => moment(live['created_at'])
  .add(10, 'minutes')
  .isSameOrAfter(moment(live['start_at']))

export { getUnixAfterDays, getUnixBeforeDays, getUnix, isGuerrillaLive }
