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
  const { limit = 20, ...params } = options

  const searchParams = new URLSearchParams({ limit, ...params })

  let page = 0
  let shouldContinue = true

  do {
    page += 1
    searchParams.set('page', page.toString())

    const { lives } = await fetchData(`https://holo.dev/api/v1/lives/${endpoint}?${searchParams.toString()}`)

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

// TODO: Use lodash to convert keys
const getEndedLives = async ({ startAfter, startBefore, ...options }) => {
  const { value } = await liveFetcher('ended', {
    start_after: startAfter,
    start_before: startBefore,
    ...options,
  }).next()
  return value
}

const getCurrentLives = () => fetchLives('current')

const getScheduledLives = ({ startBefore, ...options }) => fetchLives('scheduled', {
  start_before: startBefore,
  ...options,
})

const getChannels = async () => {
  const { channels } = await fetchData('https://holo.dev/api/v1/channels?limit=100')
  return channels
}

const getMembers = () => fetchData('https://holo.dev/api/v1/members')

export {
  getEndedLives,
  getCurrentLives,
  getScheduledLives,
  getChannels,
  getMembers,
}
