import { userRequestApi } from '@/utils/requestUtils'

export function queryOptions(type) {
  const data = {}
  return userRequestApi('/' + type.toLowerCase() + '/query' + type + 'Options', 'get', data)
}

export function allocation(type, data) {
  return userRequestApi('/' + type.toLowerCase() + '/allocation' + type, 'post', data)
}

export function queryRoleOfUser(type, data) {
  return userRequestApi('/' + type.toLowerCase() + '/query' + type + 'Role', 'post', data)
}

export function existCode(data) {
  return userRequestApi("/usermanagement/existCode",'post',data);
}
