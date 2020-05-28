import { commonRequestUtil, authRequestApi, userRequestApi } from '@/utils/requestUtils'

export function login(data) {
  console.log(data)
  return authRequestApi('/login', 'post', data)
}

export function getInfo() {
  const data = {}
  const commonResquest = commonRequestUtil(data)
  return authRequestApi('/getInfo', 'post', commonResquest)
}

export function logout(data) {
  const commonResquest = commonRequestUtil(data)
  return authRequestApi('/logout', 'post', commonResquest)
}

export function getMenu() {
  const data = {}
  const commonResquest = commonRequestUtil(data)
  return authRequestApi('/getMenu', 'post', commonResquest)
}
