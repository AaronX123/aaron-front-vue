import { basedataRequestApi } from '@/utils/requestUtils'

export function save(data) {
  return basedataRequestApi('/combExamConfigItem/saveCombExamConfig', 'post', data)
}

export function del(data) {
  return basedataRequestApi('/combExamConfigItem/deleteCombExamConfig', 'post', data)
}

export function update(data) {
  return basedataRequestApi('/combExamConfigItem/updateCombExamConfig', 'post', data)
}

export function query(data) {
  return basedataRequestApi('/combExamConfigItem/queryCombExamConfig', 'post', data)
}

export function queryConfigItem(data) {
  return basedataRequestApi('/combExamConfigItem/queryCombExamConfigItem', 'post', data)
}
