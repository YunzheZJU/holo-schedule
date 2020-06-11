const getCurrentLives = async () => {
  const response = await fetch('https://holo.dev/api/v1/lives/current')
  if (!response.ok) {
    throw new Error(`Network error: ${response.status}`)
  }
  return await response.json()
}

export {
  getCurrentLives
}