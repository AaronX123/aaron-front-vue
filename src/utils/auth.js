import Cookies from 'js-cookie'

const TokenKey = 'boss_bes_token'

// const MenuTreeKey = 'boss_bes_menu'

/**
 * token相关操作 - 获取.保存.删除
 * 将 token放入Cookie保存
 */

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

// export function getMenuData() {
//   return Cookies.get(MenuTreeKey)
// }

// export function setMenuData(MenuTree) {
//   return Cookies.set(MenuTreeKey, MenuTree)
// }

export function getCookies(key) {
  return Cookies.get(key)
}

export function setCookies(key, value) {
  return Cookies.set(key, value)
}

export function removeCookies(key) {
  return Cookies.remove(key)
}

export function clearAllCookie() {
  var keys = document.cookie.match(/[^ =;]+(?=\=)/g)
  if (keys) {
    for (var i = keys.length; i--;) {
      document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
    }
  }
}
