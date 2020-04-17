import { userRequestApi } from '@/utils/requestUtils'

export function queryOptions(type) {
  const data = {}
  return userRequestApi('/' + type.toLowerCase() + '/query' + type + 'Options', 'post', data)
}
