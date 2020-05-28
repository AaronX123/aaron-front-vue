import { basedataRequestApi } from '@/utils/requestUtils'

export function save(data) {
  return basedataRequestApi('/category/saveCategory', 'post', data)
}

export function del(data) {
  return basedataRequestApi('/category/deleteCategory', 'post', data)
}

export function update(data) {
  return basedataRequestApi('/category/updateCategory', 'post', data)
}

export function query(data) {
  return basedataRequestApi('/category/queryCategory', 'post', data)
}

export function queryCategory(data) {
  return basedataRequestApi('/category/queryCategoryInfo', 'post', data)
}

export function getList(data) {
  return basedataRequestApi('/category/getCategoryTree', 'get', data)
}

export function getUpdateForm(data) {
  return basedataRequestApi('/category/getUpdateForm', 'post', data)
}
