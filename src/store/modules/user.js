import { login, logout, getInfo, getMenu } from '@/api/user'
import { getToken, setToken, removeToken, clearAllCookie } from '@/utils/auth'
import { saveHead } from '@/utils/requestUtils'
import { getMenuTree, converter, getOptionPermission } from '@/utils/getMenuTree'
import router, { resetRouter, errorRouter } from '@/router'
// import Layout from '@/layout'
import store from '@/store'


const state = {
  token: getToken(),
  id: '',
  name: '',
  profilePicture: '',
  companyId: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_ID: (state, id) => {
    state.id = id
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_PROFILEPICTURE: (state, profilePicture) => {
    state.profilePicture = profilePicture
  },
  SET_COMPANYID: (state, companyId) => {
    state.companyId = companyId
  },
  SET_PREMS: (state, perms) => {
    state.perms = perms
  }
}

const actions = {
  // login({ commit }) {
  //   commit('SET_TOKEN', 'eyJhbGciOiJIUzI1NiJ9.eyJjb21wYW55SWQiOiIxIiwicm9sZUlkIjoiMSIsImlzcyI6InN5c191c2VyIiwibmFtZSI6IuWViuWViiIsImlkIjoiMSIsImV4cCI6MTU3MjUyNDk0OSwiaWF0IjoxNTY3MzQwOTQ5LCJvcmdJZCI6IjExMSJ9.dXxChYbmFC8ZrzQGDXHwDGcQldlhI1kcncDjcbD-U5w')
  //   setToken('eyJhbGciOiJIUzI1NiJ9.eyJjb21wYW55SWQiOiIxIiwicm9sZUlkIjoiMSIsImlzcyI6InN5c191c2VyIiwibmFtZSI6IuWViuWViiIsImlkIjoiMSIsImV4cCI6MTU3MjUyNDk0OSwiaWF0IjoxNTY3MzQwOTQ5LCJvcmdJZCI6IjExMSJ9.dXxChYbmFC8ZrzQGDXHwDGcQldlhI1kcncDjcbD-U5w')
  //   saveHead('boss-bes-1.0', 'businessType', 'deviceId', 0, true)
  // },
  // getInfo({ commit }) {
  //   commit('SET_NAME', '张三')
  //   commit('SET_PROFILEPICTURE', '@/assets/my.jpg')
  // },
  // 用户登录
  login({ commit }, userInfo) {
    const { code, password, ip } = userInfo
    return new Promise((resolve, reject) => {
      login({ code: code.trim(), password: password, ip: ip })
        .then(res => {
          const data = res
          commit('SET_TOKEN', data.token)
          setToken(data.token)
          saveHead('1')
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  // 获取用户基础信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo().then(res => {
        const data = res
        if (!data) {
          reject('验证失败，请重新登录')
        }
        const { id, name, profilePicture, companyId } = data
        commit('SET_ID', id)
        commit('SET_NAME', name)
        commit('SET_PROFILEPICTURE', profilePicture)
        commit('SET_COMPANYID', companyId)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // 获取用户菜单
  getMenu({ commit, state }) {
    return new Promise((resolve, reject) => {
      getMenu().then(res => {
        const menu = res
        if (!menu) {
          reject('验证失败，请重新登录')
        }
        const perms = getOptionPermission(menu)
        commit('SET_PREMS', perms)
        const newMenu = converter(menu)
        const MenuTree = getMenuTree(newMenu)
        MenuTree.push(errorRouter)
        resetRouter()
        router.options.routes = MenuTree
        router.addRoutes(MenuTree)
        console.log(newMenu)
        console.log(MenuTree);
        console.log(router);
        resolve(menu)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 用户退出
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      const data = []
      data[0] = state.id
      logout(data)
        .then(() => {
          commit('SET_TOKEN', '')
          clearAllCookie()
          resetRouter()
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // 删除 token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      removeToken()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
