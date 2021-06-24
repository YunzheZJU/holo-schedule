const constructRoomUrl = ({ platform, room, time }) => ({
  youtube: `https://www.youtube.com/watch?v=${room}${time ? `&t=${time}` : ''}`,
  bilibili: `https://live.bilibili.com/${room}`,
  twitch: `https://www.twitch.tv/${room}`,
  twitcasting: `https://twitcasting.tv/${room}`,
}[platform])

// eslint-disable-next-line import/prefer-default-export
export { constructRoomUrl }
