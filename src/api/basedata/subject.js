import { basedataRequestApi } from '@/utils/requestUtils'

export function save(data) {
  return basedataRequestApi('/subject/saveSubject', 'post', data)
}

export function del(data) {
  return basedataRequestApi('/subject/deleteSubjectList', 'post', data)
}

export function update(data) {
  return basedataRequestApi('/subject/updateSubject', 'post', data)
}

export function query(data) {
  return basedataRequestApi('/subject/querySubject', 'post', data)
}

export function queryAnswer(data) {
  return basedataRequestApi('/subject/queryAnswer', 'post', data)
}
