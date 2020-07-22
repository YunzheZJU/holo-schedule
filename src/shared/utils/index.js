const constructRoomUrl = ({ platform, room }) => {
  if (platform === 'youtube') {
    return `https://www.youtube.com/watch?v=${room}`
  }
  if (platform === 'bilibili') {
    return `https://live.bilibili.com/${room}`
  }

  return undefined
}

// eslint-disable-next-line import/prefer-default-export
export { constructRoomUrl }
