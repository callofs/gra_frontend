import { defineStore } from 'pinia'
import { getAvatar, getCurrentUser } from '@/api/user'

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

function blobToDataUrl(blob) {
  const normalizedBlob =
    blob && typeof blob === 'object' && blob.type === 'application/octet-stream'
      ? new Blob([blob], { type: 'image/png' })
      : blob

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('读取头像失败'))
    reader.readAsDataURL(normalizedBlob)
  })
}

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

          try {
            const avatarBlob = await getAvatar()
            if (avatarBlob && typeof avatarBlob === 'object' && typeof avatarBlob.size === 'number' && avatarBlob.size > 0) {
              const avatarDataUrl = await blobToDataUrl(avatarBlob)
              if (avatarDataUrl) {
                this.setUserInfo({
                  ...(this.userInfo || {}),
                  avatar: avatarDataUrl,
                })
              }
            }
          } catch (error) {
          }

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
