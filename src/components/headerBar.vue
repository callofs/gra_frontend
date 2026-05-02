<template>
  <header class="header">
    <div class="container">
      <div class="nav-wrap">
        <div class="logo" @click="goHome">
          <div class="logo-icon">育</div>
          <div class="logo-text">育儿成长家</div>
        </div>

        <nav class="menu">
          <RouterLink class="item" to="/home">首页</RouterLink>
          <RouterLink class="item" to="/forum">主题论坛</RouterLink>
          <RouterLink class="item" to="/market">互助市场</RouterLink>
          <RouterLink class="item" to="/lectures">专家辅导</RouterLink>
          <RouterLink class="item" to="/courses">在线课程</RouterLink>
          <RouterLink class="item" to="/profile">个人中心</RouterLink>
        </nav>

        <div class="actions">
          <div class="search">
            <span class="search-icon">🔎</span>
            <input v-model="keyword" class="search-input" placeholder="搜索育儿知识、课程、讲座" />
          </div>

          <button v-if="isLoggedIn" class="icon-btn" type="button" aria-label="通知">
            <span class="badge"></span>
            <span>🔔</span>
          </button>
          <button v-if="isLoggedIn" class="user-chip" type="button" @click="goProfile">
            <img v-if="avatarSrc" class="avatar-image" :src="avatarSrc" alt="用户头像" />
            <span v-else class="avatar-text">{{ avatarText }}</span>
            <span class="user-name" :title="displayName">{{ displayNameShort }}</span>
          </button>
          <button v-if="isLoggedIn" class="logout-btn" type="button" @click="logout">退出</button>
          <button v-else class="login-btn" type="button" @click="goLogin">登录</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { logoutRequest } from '@/api/user'
import { useAppStore } from '@/store/app'

const router = useRouter()
const appStore = useAppStore()
const keyword = ref('')

const isLoggedIn = computed(() => appStore.isLoggedIn)

const displayName = computed(() => {
  return appStore.userInfo.nickname || appStore.username || '游客'
})

const displayNameShort = computed(() => {
  const rawName = String(displayName.value ?? '').trim()
  const maxLength = 6

  if (!rawName) return '游客'
  if (rawName.length <= maxLength) return rawName

  return `${rawName.slice(0, maxLength)}…`
})

const avatarSrc = computed(() => {
  const rawAvatar = appStore.userInfo?.avatar

  if (!rawAvatar || typeof rawAvatar !== 'string') return ''

  const normalizedAvatar = rawAvatar.trim()
  if (!normalizedAvatar) return ''

  if (normalizedAvatar.startsWith('data:image')) {
    return normalizedAvatar
  }

  return `data:image/png;base64,${normalizedAvatar}`
})

const avatarText = computed(() => {
  return String(displayName.value).trim().slice(0, 1).toUpperCase() || '游'
})

function goHome() {
  router.push('/home')
}

function goProfile() {
  router.push('/profile')
}

function goLogin() {
  router.push('/login')
}

async function logout() {
  try {
    await logoutRequest()
  } catch (error) {
  } finally {
    appStore.logout()
    router.replace('/home')
  }
}
</script>

<style scoped>
.header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid rgba(226, 232, 240, 1);
  position: sticky;
  top: 0;
  z-index: 20;
}

.container {
  padding: 0 120px;
}

.nav-wrap {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 900;
  background: linear-gradient(180deg, rgba(59, 130, 246, 1), rgba(34, 211, 238, 1));
}

.logo-text {
  font-size: 20px;
  font-weight: 800;
  color: rgba(30, 41, 59, 1);
}

.menu {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
  flex-wrap: wrap;
}

.item {
  text-decoration: none;
  color: rgba(71, 85, 105, 1);
  font-size: 15px;
  padding: 8px 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-bottom: 2px solid transparent;
  transition: color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
  border-radius: 8px;
  padding: 8px 10px;
}

.item:hover {
  color: rgba(30, 41, 59, 1);
  background: rgba(248, 250, 252, 1);
  border-bottom-color: rgba(59, 130, 246, 1);
}

.item.router-link-active {
  color: rgba(30, 41, 59, 1);
  border-bottom-color: rgba(59, 130, 246, 1);
}

.actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-chip {
  height: 36px;
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 1);
  background: rgba(248, 250, 252, 1);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
}

.avatar-image {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  object-fit: cover;
  flex-shrink: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 700;
  color: rgba(30, 41, 59, 1);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn,
.login-btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(226, 232, 240, 1);
  background: #fff;
  color: rgba(30, 41, 59, 1);
  cursor: pointer;
  font-weight: 700;
}

.logout-btn:hover,
.login-btn:hover {
  background: rgba(248, 250, 252, 1);
}

.search {
  width: 240px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(226, 232, 240, 1);
  background: rgba(248, 250, 252, 1);
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-icon {
  font-size: 14px;
  color: rgba(148, 163, 184, 1);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: rgba(30, 41, 59, 1);
}

.search-input::placeholder {
  color: rgba(148, 163, 184, 1);
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(226, 232, 240, 1);
  background: #fff;
  position: relative;
  cursor: pointer;
}

.badge {
  position: absolute;
  width: 9px;
  height: 8px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 1);
  top: 6px;
  left: 8px;
}

.avatar-text {
  font-weight: 900;
  color: rgba(30, 41, 59, 1);
}

@media (max-width: 980px) {
  .container {
    padding: 0 16px;
  }

  .menu {
    display: none;
  }
}
</style>