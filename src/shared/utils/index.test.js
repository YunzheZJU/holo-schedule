import { constructRoomUrl } from './index'

test('should construct room url', () => {
  const liveOne = { platform: 'youtube', room: 'NewRoom' }
  const liveTwo = { platform: 'bilibili', room: 'NewRoom' }
  const liveThree = { platform: 'unknown', room: 'NewRoom' }

  expect(constructRoomUrl(liveOne)).toEqual(`https://www.youtube.com/watch?v=${liveOne.room}`)
  expect(constructRoomUrl(liveTwo)).toEqual(`https://live.bilibili.com/${liveTwo.room}`)
  expect(constructRoomUrl(liveThree)).toEqual(undefined)
})
