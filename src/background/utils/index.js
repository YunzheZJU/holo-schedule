const getTimeAfterDays = days => {
  const result = new Date()

  result.setDate(result.getDate() + days)

  return Math.floor(result.getTime() / 1000)
}

// eslint-disable-next-line import/prefer-default-export
export { getTimeAfterDays }
