import { basedataRequestApi } from '@/utils/requestUtils'

export function save(data) {
  return basedataRequestApi('/dictionary/saveDictionary', 'post', data)
}

export function del(data) {
  return basedataRequestApi('/dictionary/deleteDictionary', 'post', data)
}

export function update(data) {
  return basedataRequestApi('/dictionary/updateDictionary', 'post', data)
}

export function query(data) {
  return basedataRequestApi('/dictionary/queryDictionary', 'post', data)
}

export function queryDictionary(data) {
  return basedataRequestApi('/dictionary/queryDictionaryValue', 'post', data)
}

