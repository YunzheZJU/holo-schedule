const getTimeAfterDays = days => {
  const result = new Date()

  result.setDate(result.getDate() + days)

  return Math.floor(result.getTime() / 1000)
}

const getTimeBeforeDays = days => getTimeAfterDays(-days)

export { getTimeAfterDays, getTimeBeforeDays }
