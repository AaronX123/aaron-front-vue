import { basedataRequestApi } from '@/utils/requestUtils'

export function save(type, data) {
  return basedataRequestApi('/' + type + '/save', 'post', data)
}

export function del(type, data) {
  return basedataRequestApi('/' + type + '/delete', 'delete', data)
}

export function update(type, data) {
  return basedataRequestApi('/' + type + '/update', 'put', data)
}

export function query(type, data) {
  return basedataRequestApi('/' + type + '/query', 'post', data)
}
