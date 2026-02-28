<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand" @click="goHome">家长育儿互助平台</div>

      <nav class="nav">
        <RouterLink class="nav-item" to="/forum">论坛</RouterLink>
        <RouterLink class="nav-item" to="/market">闲置交易</RouterLink>
        <RouterLink class="nav-item" to="/lectures">专家讲座</RouterLink>
        <RouterLink class="nav-item" to="/courses">在线课程</RouterLink>
        <RouterLink class="nav-item" to="/profile">个人中心</RouterLink>
      </nav>

      <div class="right">
        <div class="user">{{ displayName }}</div>
        <button class="btn ghost" type="button" @click="logout">退出</button>
      </div>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const displayName = computed(() => {
  return localStorage.getItem('demo_user') || '游客'
})

function goHome() {
  router.push('/forum')
}

function logout() {
  localStorage.removeItem('demo_token')
  localStorage.removeItem('demo_user')
  router.replace('/login')
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f6f7fb;
}

.topbar {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 18px;
  background: #0f172a;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand {
  font-weight: 700;
  letter-spacing: 0.3px;
  cursor: pointer;
  user-select: none;
}

.nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
  flex-wrap: wrap;
}

.nav-item {
  color: rgba(255, 255, 255, 0.86);
  text-decoration: none;
  padding: 8px 10px;
  border-radius: 10px;
  transition: background 0.15s ease, color 0.15s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.nav-item.router-link-active {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user {
  font-size: 13px;
  opacity: 0.95;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn {
  border: none;
  outline: none;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
}

.btn.ghost {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.btn.ghost:hover {
  background: rgba(255, 255, 255, 0.18);
}

.content {
  width: min(1100px, calc(100% - 28px));
  margin: 18px auto;
}
</style>
