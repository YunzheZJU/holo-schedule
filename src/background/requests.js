const getCurrentLives = async () => {
  const limit = 20

  let page = 0
  let currentLives = []
  let shouldContinue = true

  while (shouldContinue) {
    const response = await fetch(`https://holo.dev/api/v1/lives/current?limit=${limit}&page=${page}`)
    if (!response.ok) {
      throw new Error(`Network error: ${response.status}`)
    }
    const { lives } = await response.json()
    currentLives = currentLives.concat(lives)

    if (lives.length < limit) {
      shouldContinue = false
    } else {
      page += 1
    }
  }

  return currentLives
}

const getScheduledLives = async () => {
  const limit = 20

  let page = 1
  let scheduledLives = []
  let shouldContinue = true

  while (shouldContinue) {
    const response = await fetch(`https://holo.dev/api/v1/lives/scheduled?limit=${limit}&page=${page}`)
    if (!response.ok) {
      throw new Error(`Network error: ${response.status}`)
    }
    const { lives } = await response.json()
    scheduledLives = scheduledLives.concat(...lives)

    if (lives.length < limit) {
      shouldContinue = false
    } else {
      page += 1
    }
  }

  return scheduledLives
}

const getChannels = async () => {
  const response = await fetch('https://holo.dev/api/v1/channels?limit=100')
  if (!response.ok) {
    throw new Error(`Network error: ${response.status}`)
  }
  const { channels } = await response.json()
  return channels
}

const getMembers = async () => {
  const response = await fetch('https://holo.dev/api/v1/members')
  if (!response.ok) {
    throw new Error(`Network error: ${response.status}`)
  }
  return await response.json()
}

export {
  getCurrentLives,
  getScheduledLives,
  getChannels,
  getMembers,
}