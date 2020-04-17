import { commonRequestUtil, paperRequestApi } from '@/utils/requestUtils'

export function queryPaperWithCondition(data) {
  const commonResquest = commonRequestUtil(data)
  return paperRequestApi('/maintain/queryPaper', 'post', commonResquest)
}

export function modifyPaper(data) {
  const commonResquest = commonRequestUtil(data)
  return paperRequestApi('/maintain/modifyPaper', 'post', commonResquest)
}

export function deletePaper(data) {
  const commonResquest = commonRequestUtil(data)
  return paperRequestApi('/maintain/deletePaper', 'post', commonResquest)
}

export function paperDetail(data) {
  const commonResquest = commonRequestUtil(data)
  return paperRequestApi('/maintain/paperDetail', 'post', commonResquest)
}
