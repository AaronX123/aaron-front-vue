import { basedataRequestApi } from '@/utils/requestUtils'

export function save(data) {
  return basedataRequestApi('/subjectType/saveSubjectType', 'post', data)
}

export function del(data) {
  return basedataRequestApi('/subjectType/deleteSubjectType', 'post', data)
}

export function update(data) {
  return basedataRequestApi('/subjectType/updateSubjectType', 'post', data)
}

export function query(data) {
  return basedataRequestApi('/subjectType/querySubjectType', 'post', data)
}

export function querySubjectType(data) {
  return basedataRequestApi('/subjectType/querySubjectTypeUpdateForm', 'post', data)
}
