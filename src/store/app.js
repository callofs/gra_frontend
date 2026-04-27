import { defineStore } from 'pinia'
import { getCurrentUser } from '@/api/user'

const objMap = {
  0: '普通用户',
  1: '管理员',
  2: '专家'
}

const defaultState = () => ({
  isAuthenticated: false,
  userInfo: null,
  authInitialized: false,
  authInitializing: false,
  loading: false,
  theme: 'light'
})

export const useAppStore = defineStore('app', {
  state: () => defaultState(),
  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    username: (state) => state.userInfo?.username || state.userInfo?.name || '',
    role: (state) => state.userInfo?.role ? objMap[state.userInfo?.role] : '普通用户',
  },
  actions: {
    setAuthenticated(isAuthenticated) {
      this.isAuthenticated = Boolean(isAuthenticated)
    },
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      this.isAuthenticated = Boolean(userInfo)
    },
    setAuthInitialized(authInitialized) {
      this.authInitialized = Boolean(authInitialized)
    },
    setLoading(loading) {
      this.loading = loading
    },
    setTheme(theme) {
      this.theme = theme
    },
    logout() {
      this.isAuthenticated = false
      this.userInfo = null
    },
    async initAuth(force = false) {
      if (this.authInitializing) {
        const promise = this._initAuthPromise
        if (promise && typeof promise.then === 'function') {
          try {
            await promise
          } catch (error) {
          }
        }

        return this.isAuthenticated
      }
      if (this.authInitialized && !force) return this.isAuthenticated

      this.authInitializing = true

      this._initAuthPromise = (async () => {
        try {
          const result = await getCurrentUser()
          const userInfo = result?.userInfo || result?.data || result

          this.setUserInfo(userInfo)
          this.setAuthInitialized(true)
          return true
        } catch (error) {
          this.logout()
          this.setAuthInitialized(true)
          return false
        } finally {
          this.authInitializing = false
        }
      })()

      try {
        return await this._initAuthPromise
      } finally {
        this._initAuthPromise = null
      }
    },
    resetState() {
      Object.assign(this, defaultState())
    }
  }
})
