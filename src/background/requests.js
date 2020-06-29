/* eslint-disable no-await-in-loop */
const gatherResponse = async response => {
  if (response.headers.get('content-type').includes('application/json')) {
    return response.json()
  }
  return response.text()
}

const fetchData = async (...args) => {
  const response = await fetch(...args)

  if (!response.ok) {
    throw new Error(`Network error: ${response.status}`)
  }

  return gatherResponse(response)
}

async function* liveFetcher(endpoint, options = {
  limit: 20,
}) {
  const { limit = 20 } = options

  let page = 0
  let shouldContinue = true

  do {
    page += 1

    const { lives } = await fetchData(`https://holo.dev/api/v1/lives/${endpoint}?limit=${limit}&page=${page}`)

    yield lives

    if (lives.length < limit) {
      shouldContinue = false
    }
  } while (shouldContinue)
}

const fetchLives = async (...args) => {
  const currentLives = []

  // eslint-disable-next-line no-restricted-syntax
  for await (const lives of liveFetcher(...args)) {
    currentLives.push(lives)
  }

  return currentLives.flat()
}

const getCurrentLives = () => fetchLives('current')

const getScheduledLives = () => fetchLives('scheduled')

const getChannels = async () => {
  const { channels } = await fetchData('https://holo.dev/api/v1/channels?limit=100')
  return channels
}

const getMembers = () => fetchData('https://holo.dev/api/v1/members')

export {
  getCurrentLives,
  getScheduledLives,
  getChannels,
  getMembers,
}
