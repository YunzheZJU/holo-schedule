const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const padTwoDigits = (number = 0) => number.toString().padStart(2, '0')

const formatDuration = (duration = 0) => {
  const secondsPerHour = 60 * 60
  const secondsPerMinute = 60
  const hours = Math.floor(duration / secondsPerHour)
  const minutes = Math.floor((duration - hours * secondsPerHour) / secondsPerMinute)
  const seconds = Math.floor(duration - minutes * secondsPerMinute - hours * secondsPerHour)
  return `${hours}:${padTwoDigits(minutes)}:${padTwoDigits(seconds)}`
    .replace(/^0:/, '')
}

export { sleep, formatDuration }
