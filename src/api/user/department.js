import { userRequestApi } from '@/utils/requestUtils'

export function queryLevel() {
  const data = {}
  return userRequestApi('/department/queryDepartmentLevel', 'post', data)
}

export function queryParent() {
  const data = {}
  return userRequestApi('/department/queryDepartmentParent', 'post', data)
}

