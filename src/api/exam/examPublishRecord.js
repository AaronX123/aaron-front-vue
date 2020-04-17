import { commonRequestUtil, examRequestApi } from '@/utils/requestUtils'

export function query(data) {
  const commonResquest = commonRequestUtil(data)
  return examRequestApi('/exampublishrecord/query', 'post', commonResquest)
}

export function save(data) {
  const commonResquest = commonRequestUtil(data)
  return examRequestApi('/exampublishrecord/save', 'post', commonResquest)
}

export function del(data) {
  const commonResquest = commonRequestUtil(data)
  return examRequestApi('/exampublishrecord/del', 'post', commonResquest)
}

export function update(data) {
  const commonResquest = commonRequestUtil(data)
  return examRequestApi('/exampublishrecord/update', 'post', commonResquest)
}

export function getPaperInfo(data) {
  const commonResquest = commonRequestUtil(data)
  return examRequestApi(
    '/exampublishrecord/getpaperinfo',
    'post',
    commonResquest
  )
}

export function getUserInfo(data) {
  const commonResquest = commonRequestUtil(data)
  return examRequestApi(
    '/exampublishrecord/getuserinfo',
    'post',
    commonResquest
  )
}
