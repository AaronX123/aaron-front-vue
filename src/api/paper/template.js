import { commonRequestUtil, paperRequestApi } from '@/utils/requestUtils'

export function downloadPaper(data) {
  const commonResquest = commonRequestUtil(data)
  return paperRequestApi('/template/download', 'post', commonResquest)
}

export function uploadPaper(data) {
  const commonRequest = commonRequestUtil(data)
  return paperRequestApi('/template/upload','post',commonRequest)
}
export function deletePaper(data) {
  const commonResquest = commonRequestUtil(data)
  return paperRequestApi('/template/delete', 'post', commonResquest)
}

export function queryPaper(data) {
  const commonResquest = commonRequestUtil(data)
  return paperRequestApi('/template/queryTemplate', 'post', commonResquest)
}
