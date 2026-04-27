import axios from 'axios'
import pinia from '@/store'
import { useAppStore } from '@/store/app'

const baseURL = import.meta.env.VITE_API_BASE_URL
const currentUserPath = import.meta.env.VITE_API_CURRENT_USER_PATH || '/user/profile'

// 创建 axios 实例：统一 baseURL / 超时时间等配置
const service = axios.create({
  baseURL: baseURL,
  timeout: 15000,
  withCredentials: true,
})


function getAppStore() {
  return useAppStore(pinia)
}

function shouldRedirectToLogin(config) {
  const requestUrl = typeof config?.url === 'string' ? config.url : ''
  const isCurrentUserRequest = requestUrl === currentUserPath

  return !config?.skipAuthRedirect && !isCurrentUserRequest && location.pathname !== '/login'
}

// 请求拦截器：统一携带 Cookie 凭证
service.interceptors.request.use(
  (config) => config,
  // 请求发送前发生错误：统一错误结构后抛出
  (error) => Promise.reject(normalizeAxiosError(error))
)

// 响应拦截器：统一处理后端业务返回结构 / 统一错误处理
service.interceptors.response.use(
  (response) => {
    const data = response?.data
    const requestUrl = response?.config?.url

    // 如果后端返回的不是对象（例如直接返回字符串/数组等），直接透传
    if (!data || typeof data !== 'object') return data

    // 兼容后端统一返回格式：{ code, message, data }
    if ('code' in data) {
      const code = Number(data.code)

      // 业务成功：返回真正的业务数据 data
      if (code === 200) return 'data' in data ? data.data : data

      // 业务层未登录/登录过期：即使 HTTP=200，也需要引导去登录
      if (code === 401) {
        getAppStore().logout()

        if (shouldRedirectToLogin(response?.config)) {
          const redirect = encodeURIComponent(location.pathname + location.search + location.hash)
          location.replace(`/login?redirect=${redirect}`)
        }

        const err = new Error('登录已过期，请重新登录')
        err.code = code
        err.status = 401
        err.data = data
        return Promise.reject(err)
      }

      // 业务失败：抛出错误，交给页面 catch 处理
      const message = typeof data.message === 'string' && data.message ? data.message : '请求失败'
      const err = new Error(message)
      err.code = code
      err.status = response?.status || 0
      err.data = data
      return Promise.reject(err)
    }

    // 不包含 code 字段：认为就是业务数据，直接返回
    return data
  },
  (error) => {
    // HTTP / 网络层错误统一归一化
    const normalized = normalizeAxiosError(error)

    // HTTP 401：统一清理 token 并跳转登录页
    if (normalized.status === 401) {
      getAppStore().logout()

      if (shouldRedirectToLogin(error?.config)) {
        const redirect = encodeURIComponent(location.pathname + location.search + location.hash)
        location.replace(`/login?redirect=${redirect}`)
      }
    }

    return Promise.reject(normalized)
  }
)

function normalizeAxiosError(error) {
  // 兜底：非对象错误
  if (!error || typeof error !== 'object') {
    const e = new Error('未知错误')
    e.status = 0
    return e
  }

  // 将 axios error 统一转换为 Error，并补充常用字段，方便页面统一处理
  const err = new Error(error.message || '请求失败')
  err.isAxiosError = !!error.isAxiosError
  err.status = error.response?.status || 0
  err.data = error.response?.data
  err.url = error.config?.url
  err.method = error.config?.method

  // 超时错误
  if (error.code === 'ECONNABORTED') err.message = '请求超时'

  // 无 response 通常表示网络异常（断网/CORS/DNS 等）
  if (!error.response) err.message = err.message || '网络异常'

  return err
}

export default service
