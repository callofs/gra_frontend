<template>
  <header class="header">
    <div class="container">
      <div class="nav-wrap">
        <div class="logo" @click="goHome">
          <div class="logo-icon">育</div>
          <div class="logo-text">育儿成长家</div>
        </div>

        <nav class="menu">
          <RouterLink class="item" to="/home">
            <span class="item-icon" aria-hidden="true">🏠</span>
            <span class="item-text">首页</span>
          </RouterLink>
          <RouterLink class="item" to="/forum">
            <span class="item-icon" aria-hidden="true">💬</span>
            <span class="item-text">主题论坛</span>
          </RouterLink>
          <RouterLink class="item" to="/market">
            <span class="item-icon" aria-hidden="true">🛍️</span>
            <span class="item-text">互助市场</span>
          </RouterLink>
          <RouterLink class="item" to="/lectures">
            <span class="item-icon" aria-hidden="true">🧑‍⚕️</span>
            <span class="item-text">专家辅导</span>
          </RouterLink>
          <RouterLink class="item" to="/courses">
            <span class="item-icon" aria-hidden="true">📰</span>
            <span class="item-text">在线课程</span>
          </RouterLink>
        </nav>

        <div class="actions">
          <div class="search">
            <span class="search-icon" aria-hidden="true">🔎</span>
            <input v-model="keyword" class="search-input" placeholder="搜索专家、讲座..." />
          </div>

          <button v-if="isLoggedIn" class="icon-btn" type="button" aria-label="通知">
            <span class="badge"></span>
            <span class="icon" aria-hidden="true">🔔</span>
          </button>
          <button v-if="isLoggedIn" class="avatar-btn" type="button" @click="goProfile" aria-label="用户中心">
            <img v-if="avatarSrc" class="avatar-image" :src="avatarSrc" alt="用户头像" />
            <span v-else class="avatar-text">{{ avatarText }}</span>
          </button>
          <button v-else class="login-btn" type="button" @click="goLogin">登录</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/app'

const router = useRouter()
const appStore = useAppStore()
const keyword = ref('')

const isLoggedIn = computed(() => appStore.isLoggedIn)

const displayName = computed(() => {
  return appStore.userInfo.nickname || appStore.username || '游客'
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
  gap: 32px;
  flex: 1;
  justify-content: center;
  flex-wrap: wrap;
}

.item {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-radius: 10px;
  transition: background-color 0.15s ease, transform 0.15s ease;
}

.item-icon {
  font-size: 18px;
  line-height: 1;
  color: rgba(100, 116, 139, 1);
}

.item-text {
  font-size: 15px;
  color: rgba(71, 85, 105, 1);
  transition: color 0.15s ease;
}

.item:hover {
  background: rgba(248, 250, 252, 1);
  transform: translateY(-1px);
}

.item:hover .item-text {
  color: rgba(30, 41, 59, 1);
}

.item:hover .item-icon {
  color: rgba(100, 116, 139, 1);
}

.item.router-link-active .item-text {
  color: rgba(30, 41, 59, 1);
  font-weight: 600;
}

.item.router-link-active .item-icon {
  color: rgba(168, 85, 247, 1);
}

.actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
  flex-shrink: 0;
}

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
  font-size: 14px;
  color: rgba(30, 41, 59, 1);
}

.search-input::placeholder {
  color: rgba(148, 163, 184, 1);
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: none;
  background: transparent;
  position: relative;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.icon-btn:hover {
  background: rgba(248, 250, 252, 1);
}

.icon {
  font-size: 16px;
  line-height: 1;
}

.badge {
  position: absolute;
  width: 9px;
  height: 8px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 1);
  top: 4px;
  right: 6px;
}

.avatar-text {
  font-weight: 900;
  color: rgba(30, 41, 59, 1);
  font-size: 14px;
}

.avatar-btn {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: none;
  background: rgba(241, 245, 249, 1);
  cursor: pointer;
  overflow: hidden;
  display: grid;
  place-items: center;
  padding: 0;
}

.avatar-btn:hover {
  background: rgba(226, 232, 240, 1);
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