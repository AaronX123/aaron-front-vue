import request from '@/utils/request'
import { getCookies, setCookies, getToken } from '@/utils/auth'

/**
 * 请求封装的工具类
 * commonRequestUtil: 封装commonRequest
 * saveHead: 保存公用head信息到cookie
 * systemRequestApi: 系统API统一请求格式
 * baseDataRequestApi: 基础数据API统一请求格式
 * paperRequestApi: 试卷API统一请求格式
 * examRequestApi: 考试API统一请求格式
 * permissionRequestApi: 权限认证API统一请求格式
 * normalRequest: 通用请求方法
 */

/**
 * common request util
 * 从coookies 获取公共数据
 * @param params
 * @returns {{head: {deviceType, crypt, businessType, version, deviceId, token}, body: *}}
 */
export function commonRequestUtil(params) {
  const head = JSON.parse(getCookies('head') || null)
  return {
    head: {
      version: head.version,
      businessType: head.businessType,
      deviceId: head.deviceId,
      deviceType: head.deviceType,
      crypt: head.crypt,
      token: getToken()
    },
    body: params
  }
}

/**
 * 保存公用数据至cookie
 * @param version
 * @param businessType
 * @param deviceId
 * @param deviceType
 * @param crypt
 */
export function saveHead(version, businessType, deviceId, deviceType, crypt) {
  const head = {
    version: version,
    businessType: businessType,
    deviceId: deviceId,
    deviceType: deviceType,
    crypt: crypt
  }
  setCookies('head', JSON.stringify(head))
}

/**
 * 认证服务API统一请求格式
 * @param url API业务路径
 * @param method 请求类型（GET、POST、PUT、DELETE）
 * @param params 放在自定义body里面的数据
 * @returns {AxiosPromise}
 */
export function authRequestApi(url, method, params) {
  return normalRequest('/auth' + url, method, params)
}

/**
 * 系统API统一请求格式
 * @param url API业务路径
 * @param method 请求类型（GET、POST、PUT、DELETE）
 * @param params 放在自定义body里面的数据
 * @returns {AxiosPromise}
 */
export function userRequestApi(url, method, params) {
  const commonResquest = commonRequestUtil(params)
  return normalRequest('/user' + url, method, commonResquest)
}

/**
 * 基础数据API统一请求格式
 * @param url API业务路径
 * @param method 请求类型（GET、POST、PUT、DELETE）
 * @param params 放在自定义body里面的数据
 * @returns {AxiosPromise}
 */
export function basedataRequestApi(url, method, params) {
  const commonResquest = commonRequestUtil(params)
  return normalRequest('/baseinfo' + url, method, commonResquest)
}

/**
 * 试卷API统一请求格式
 * @param url API业务路径
 * @param method 请求类型（GET、POST、PUT、DELETE）
 * @param params 放在自定义body里面的数据
 * @returns {AxiosPromise}
 */
export function paperRequestApi(url, method, params) {
  return normalRequest('/paper' + url, method, params)
}

/**
 * 考试API统一请求格式
 * @param url API业务路径
 * @param method 请求类型（GET、POST、PUT、DELETE）
 * @param params 放在自定义body里面的数据
 * @returns {AxiosPromise}
 */
export function examRequestApi(url, method, params) {
  return normalRequest('/exam' + url, method, params)
}

/**
 * 权限认证API统一请求格式
 * @param url API业务路径
 * @param method 请求类型（GET、POST、PUT、DELETE）
 * @param params 放在自定义body里面的数据
 * @returns {AxiosPromise}
 */
export function permissionRequestApi(url, method, params) {
  return normalRequest('/boss/bes/permission' + url, method, params)
}

/**
 * 通用请求方法
 * @param url API业务路径
 * @param method 请求类型（GET、POST、PUT、DELETE）
 * @param params 放在自定义body里面的数据
 * @returns {AxiosPromise}
 */
export function normalRequest(url, method, params) {
  return request({
    url: url,
    method: method,
    data: params
  })
}
