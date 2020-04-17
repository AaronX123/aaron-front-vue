import { userRequestApi } from '@/utils/requestUtils'

// 增加方法的接口
export function save(type, data) {
  return userRequestApi('/' + type.toLowerCase() + '/save' + type + '', 'post', data)
}

// 删除方法的接口
export function del(type, data) {
  return userRequestApi('/' + type.toLowerCase() + '/delete' + type + '', 'delete', data)
}

// 更新方法的接口
export function update(type, data) {
  return userRequestApi('/' + type.toLowerCase() + '/update' + type + '', 'put', data)
}

// 更新前获取更新数据的接口
export function getUpdateForm(type, data) {
  return userRequestApi('/' + type.toLowerCase() + '/get' + type + 'UpdateForm', 'post', data)
}

// 查询方法的接口
export function query(type, data) {
  return userRequestApi('/' + type.toLowerCase() + '/query' + type + '', 'post', data)
}

// 获取树数据的接口
export function getList(type) {
  const data = {}
  return userRequestApi('/' + type.toLowerCase() + '/get' + type + 'List', 'post', data)
}
