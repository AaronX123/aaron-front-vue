import { basedataRequestApi } from '@/utils/requestUtils'

export function save(data) {
  return basedataRequestApi('/combExamConfig/saveCombExamConfig', 'post', data)
}

export function del(data) {
  return basedataRequestApi('/combExamConfig/deleteCombExamConfig', 'post', data)
}

export function update(data) {
  return basedataRequestApi('/combExamConfig/updateCombExamConfig', 'post', data)
}

export function query(data) {
  return basedataRequestApi('/combExamConfig/queryCombExamConfig', 'post', data)
}

export function queryConfigItem(data) {
  return basedataRequestApi('/combExamConfig/queryCombExamConfigItem', 'post', data)
}
