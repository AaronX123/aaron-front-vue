import { commonRequestUtil, examRequestApi } from '@/utils/requestUtils'

export function query(data) {
  const commonResquest = commonRequestUtil(data)
  return examRequestApi('/grade/query', 'post', commonResquest)
}

export function save(data) {
  const commonResquest = commonRequestUtil(data)
  return examRequestApi('/grade/markingpaper', 'post', commonResquest)
}

export function getPaper(data) {
  const commonResquest = commonRequestUtil(data)
  return examRequestApi('/dopaper/getPaper', 'post', commonResquest)
}

export function getPaperAnswer(data) {
  const commonResquest = commonRequestUtil(data)
  return examRequestApi('/grade/getPaperAnswer', 'post', commonResquest)
}
