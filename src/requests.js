const getCurrentLives = async () => {
  const response = await fetch('https://holo.dev/api/v1/lives/current')
  if (!response.ok) {
    throw new Error(`Network error: ${response.status}`)
  }
  return await response.json()
}

const getChannels = async () => {
  const response = await fetch('https://holo.dev/api/v1/channels?limit=100')
  if (!response.ok) {
    throw new Error(`Network error: ${response.status}`)
  }
  return await response.json()
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
  getChannels,
  getMembers,
}