import { userRequestApi } from '@/utils/requestUtils'

export function queryOptions(type) {
  const data = {}
  return userRequestApi('/' + type.toLowerCase() + '/query' + type + 'Options', 'post', data)
}

export function allocation(type, data) {
  return userRequestApi('/' + type.toLowerCase() + '/allocation' + type, 'post', data)
}

export function queryRoleOfUser(type, data) {
  return userRequestApi('/' + type.toLowerCase() + '/query' + type + 'Role', 'post', data)
}
