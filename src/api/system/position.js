import request from '@/utils/request'
/**
 * 职位管理的相关API
 */

/**
 * 分页查询
 * @param {*} params 参数
 */
export function select(params) {
  return request({
    url: '/system/position',
    method: 'get',
    params
  })
}

/**
 * 添加
 * @param {*} params 参数
 */
export function insert(params) {
  return request({
    url: '/system/position',
    method: 'post',
    data: params
  })
}

/**
 * 修改
 * @param {*} params 参数
 */
export function update(params) {
  return request({
    url: '/system/position',
    method: 'put',
    data: params
  })
}

/**
 * 删除
 * @param {*} ids 删除编号的集合
 */
export function remove(ids) {
  return request({
    url: '/system/position',
    method: 'delete',
    data: ids
  })
}

/**
 * 禁用
 * @param {*} id 禁用编号
 */
export function disable(id) {
  return request({
    url: '/system/position/status',
    method: 'put',
    data: id
  })
}
