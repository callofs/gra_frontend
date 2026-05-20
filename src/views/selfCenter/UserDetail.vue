<template>
  <div class="user-detail-page">
    <div class="container">
      <section class="hero-card">
        <button class="back-btn" type="button" @click="goBack">返回</button>

        <div v-if="loading" class="state-card">用户信息加载中...</div>

        <div v-else-if="errorMessage" class="state-card error-state">{{ errorMessage }}</div>

        <div v-else class="hero-content">
          <div class="avatar-wrap">
            <img v-if="avatarSrc" class="avatar-image" :src="avatarSrc" alt="用户头像" />
            <div v-else class="avatar-fallback">{{ avatarText }}</div>
          </div>

          <div class="info-wrap">
            <div class="name-row">
              <h1 class="display-name">{{ displayName }}</h1>
              <span class="role-tag">{{ roleText }}</span>
            </div>
            <div class="user-meta">用户 ID：{{ userInfo.id || route.params.userId || '-' }}</div>
            <div class="bio">
              {{ bioText }}
            </div>

            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">{{ creditScoreText }}</div>
                <div class="stat-label">信用分</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ statusText }}</div>
                <div class="stat-label">账号状态</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ joinDateText }}</div>
                <div class="stat-label">注册时间</div>
              </div>
            </div>

            <div class="hero-actions">
              <button class="chat-btn" type="button" @click="startChat">发起聊天</button>
            </div>
          </div>
        </div>
      </section>

      <section v-if="!loading && !errorMessage" class="content-card">
        <div class="section-title">用户详细信息</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">昵称</div>
            <div class="info-value">{{ displayName }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">用户 ID</div>
            <div class="info-value">{{ userInfo.id || route.params.userId || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">用户名</div>
            <div class="info-value">{{ userInfo.username || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">手机号</div>
            <div class="info-value">{{ userInfo.phone || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">邮箱</div>
            <div class="info-value">{{ userInfo.email || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">性别</div>
            <div class="info-value">{{ genderText }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">地址</div>
            <div class="info-value">{{ userInfo.address || '-' }}</div>
          </div>
          <div class="info-item" v-if="roleText === '专家'">
            <div class="info-label">认证材料</div>
            <div class="info-value">{{ certificationText }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">创建时间</div>
            <div class="info-value">{{ formatDateTime(userInfo.createTime) }}</div>
          </div>
          <div class="info-item full-width">
            <div class="info-label">账号说明</div>
            <div class="info-value multiline">{{ bioText }}</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createPrivateMessageSocket, getPrivateMessageSocket } from '@/api/chat'
import { getUserById } from '@/api/user'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const errorMessage = ref('')
const userInfo = ref({})

const roleMap = {
  1: '普通用户',
  2: '专家',
  3: '管理员',
}

const statusMap = {
  0: '正常',
  1: '禁用',
}

const genderMap = {
  0: '男',
  1: '女',
  2: '保密',
}

const displayName = computed(() => {
  return String(userInfo.value.nickname || route.query.nickname || userInfo.value.username || '').trim() || '未知用户'
})

const avatarSrc = computed(() => {
  const rawAvatar = String(userInfo.value.avatar || route.query.avatar || '').trim()
  if (!rawAvatar) return ''
  if (rawAvatar.startsWith('data:image')) return rawAvatar
  if (rawAvatar.startsWith('http://') || rawAvatar.startsWith('https://') || rawAvatar.startsWith('/')) return rawAvatar

  return `data:image/png;base64,${rawAvatar}`
})

const avatarText = computed(() => {
  return String(displayName.value).trim().slice(0, 1).toUpperCase() || '用'
})

const bioText = computed(() => {
  const parts = [
    userInfo.value.phone ? `手机号：${userInfo.value.phone}` : '',
    userInfo.value.email ? `邮箱：${userInfo.value.email}` : '',
    userInfo.value.address ? `地址：${userInfo.value.address}` : '',
  ].filter(Boolean)

  return parts.join('，') || '该用户暂未填写更多资料。'
})

const roleText = computed(() => {
  return roleMap[userInfo.value.role] || '普通用户'
})

const genderText = computed(() => {
  if (userInfo.value.gender === null || userInfo.value.gender === undefined || userInfo.value.gender === '') return '-'
  return genderMap[userInfo.value.gender] || '保密'
})

const statusText = computed(() => {
  if (userInfo.value.status === null || userInfo.value.status === undefined || userInfo.value.status === '') return '-'
  return statusMap[userInfo.value.status] || '未知'
})

const creditScoreText = computed(() => {
  return userInfo.value.creditScore ?? '-'
})

const certificationText = computed(() => {
  return userInfo.value.certificationMaterials ? '已上传' : '未上传'
})

const joinDateText = computed(() => {
  const formatted = formatDateTime(userInfo.value.createTime)
  return formatted === '-' ? '-' : formatted.slice(0, 10)
})

function formatDateTime(value) {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 19)
}

function ensurePrivateMessageConnection() {
  const socket = getPrivateMessageSocket()
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return socket
  }

  return createPrivateMessageSocket()
}

async function fetchUserDetail() {
  const userId = route.params.userId
  if (!userId) {
    errorMessage.value = '缺少用户 ID，无法加载用户信息。'
    userInfo.value = {}
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const res = await getUserById(userId)
    const data = res?.data ?? res ?? {}
    userInfo.value = data && typeof data === 'object' ? data : {}
    if (!userInfo.value.id) {
      errorMessage.value = '未获取到有效的用户信息。'
    }
  } catch (error) {
    userInfo.value = {}
    errorMessage.value = error?.message || '用户信息加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUserDetail()
})

watch(
  () => route.params.userId,
  () => {
    fetchUserDetail()
  }
)

function startChat() {
  const targetUserId = userInfo.value.id || route.params.userId
  if (!targetUserId) return

  try {
    ensurePrivateMessageConnection()
  } catch (error) {
  }

  router.push({
    name: 'chat',
    query: {
      targetUserId: String(targetUserId),
      targetName: displayName.value,
      targetAvatar: avatarSrc.value || '',
    },
  })
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.user-detail-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 32px 0 64px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 120px;
}

.hero-card,
.content-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.hero-card {
  padding: 24px;
}

.state-card {
  margin-top: 24px;
  min-height: 160px;
  border-radius: 12px;
  background: #f8fafc;
  display: grid;
  place-items: center;
  color: #475569;
  font-size: 16px;
  font-weight: 600;
}

.error-state {
  color: #dc2626;
  background: #fef2f2;
}

.back-btn {
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
  border-radius: 8px;
  height: 36px;
  padding: 0 14px;
  cursor: pointer;
}

.hero-content {
  margin-top: 24px;
  display: flex;
  gap: 24px;
  align-items: center;
}

.avatar-wrap {
  width: 112px;
  height: 112px;
  border-radius: 999px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
}

.avatar-image,
.avatar-fallback {
  width: 100%;
  height: 100%;
}

.avatar-image {
  object-fit: cover;
  display: block;
}

.avatar-fallback {
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: #fff;
  font-size: 36px;
  font-weight: 800;
}

.info-wrap {
  min-width: 0;
  flex: 1;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.display-name {
  margin: 0;
  font-size: 30px;
  color: #0f172a;
}

.role-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #dbeafe;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}

.user-meta,
.bio {
  margin-top: 10px;
  color: #64748b;
  line-height: 1.7;
}

.stats-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.hero-actions {
  margin-top: 20px;
}

.chat-btn {
  min-width: 116px;
  height: 42px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.22);
}

.stat-card {
  border-radius: 12px;
  background: #f8fafc;
  padding: 16px;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.stat-label {
  margin-top: 6px;
  color: #64748b;
  font-size: 13px;
}

.content-card {
  margin-top: 24px;
  padding: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.info-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.info-item {
  border-radius: 12px;
  background: #f8fafc;
  padding: 16px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  color: #64748b;
  font-size: 13px;
}

.info-value {
  margin-top: 8px;
  color: #0f172a;
  font-weight: 600;
}

.info-value.multiline {
  line-height: 1.7;
  white-space: pre-wrap;
}

@media (max-width: 1200px) {
  .container {
    padding: 0 16px;
  }
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-grid,
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
