import { userRequestApi } from '@/utils/requestUtils'

// 用户分配接口
export function allocationRole(data) {
  console.log(data)
  return userRequestApi('/role/allocationUserForRole', 'post', data)
}

// 更新资源分配的接口
export function updateResourceForRole(data) {
  return userRequestApi('/role/updateResourceForRole', 'post', data)
}

// 获取更新资源分配前，资源数据的接口
export function getResourceForRoleForm(id) {
  const data = { id }
  return userRequestApi('/role/getResourceForRoleForm', 'post', data)
}

// 获取要被分配的用户的信息
export function getUserForRoleForm(data) {
  return userRequestApi('/role/getUserForRoleForm', 'post', data)
}

