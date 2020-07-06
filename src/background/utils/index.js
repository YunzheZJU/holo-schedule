import moment from 'moment'

const getUnixAfterDays = days => moment().add(days, 'days').unix()

const getUnixBeforeDays = days => getUnixAfterDays(-days)

const getUnix = input => moment(input).unix()

export { getUnixAfterDays, getUnixBeforeDays, getUnix }
