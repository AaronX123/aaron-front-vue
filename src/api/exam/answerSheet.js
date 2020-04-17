import { commonRequestUtil, examRequestApi } from '@/utils/requestUtils'

export function query(data) {
  const commonResquest = commonRequestUtil(data)
  return examRequestApi('/answersheet/getanswersheet', 'post', commonResquest)
}
