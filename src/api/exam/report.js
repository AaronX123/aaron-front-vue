import { commonRequestUtil, examRequestApi } from '@/utils/requestUtils'

export function query(data) {
  const commonResquest = commonRequestUtil(data)
  return examRequestApi('/report/query', 'post', commonResquest)
}

export function queryDetail(data) {
  const commonResquest = commonRequestUtil(data)
  return examRequestApi('/report/querydetail', 'post', commonResquest)
}
