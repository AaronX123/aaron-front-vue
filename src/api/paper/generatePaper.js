import { commonRequestUtil, paperRequestApi } from '@/utils/requestUtils'

export function fastGen(data) {
  const commonRequest = commonRequestUtil(data)
  return paperRequestApi('/create/fastGen', 'post', commonRequest)
}

export function normalGen(data) {
  const commonRequest = commonRequestUtil(data)
  return paperRequestApi('/create/normalGen', 'post', commonRequest)
}

export function templateGen(data) {
  const commonRequest = commonRequestUtil(data)
  return paperRequestApi('/create/templateGen', 'post', commonRequest)
}
