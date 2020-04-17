import { userRequestApi } from '@/utils/requestUtils'

export function queryAllUserOnlineData(data) {
  return userRequestApi('/useronline/queryAllUserOnline', 'post', data)
}

export function mandatoryOffline(data) {
  return userRequestApi('/useronline/mandatoryOffline', 'post', data)
}
