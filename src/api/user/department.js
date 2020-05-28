import { userRequestApi } from '@/utils/requestUtils'

export function queryLevel() {
  const data = {}
  return userRequestApi('/department/queryDepartmentLevel', 'get', data)
}

export function queryParent() {
  const data = {}
  return userRequestApi('/department/queryDepartmentParent', 'get', data)
}

export function queryDepartment() {
  const data = {}
  return userRequestApi('/department/getDepartmentList','get',data);
}

