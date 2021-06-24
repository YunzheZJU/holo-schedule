const constructRoomUrl = ({ platform, room }) => ({
  youtube: `https://www.youtube.com/watch?v=${room}`,
  bilibili: `https://live.bilibili.com/${room}`,
  twitch: `https://www.twitch.tv/${room}`,
  twitcasting: `https://twitcasting.tv/${room}`,
}[platform])

// eslint-disable-next-line import/prefer-default-export
export { constructRoomUrl }
