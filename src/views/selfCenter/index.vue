<template>
  <div class="profile-page">
    <aside class="sidebar">
      <div class="sidebar-card">
        <div v-for="group in navGroups" :key="group.title" class="nav-group">
          <div class="nav-group-title">{{ group.title }}</div>
          <button
            v-for="item in group.items"
            :key="item.key"
            type="button"
            class="nav-item"
            :class="{ active: activeNav === item.key, danger: item.key === 'logout' }"
            @click="handleNavClick(item.key)"
          >
            <span class="nav-item-left">
              <span class="nav-icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </span>
            <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
          </button>
        </div>
      </div>
    </aside>

    <div class="main-column">
      <section id="profile-section" class="card hero-card">
        <div class="profile-hero">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            accept="image/*"
            :auto-upload="true"
            :before-upload="beforeAvatarUpload"
            :http-request="uploadAvatarRequest"
          >
            <div class="avatar-wrap" role="button" tabindex="0">
              <img v-if="avatarSrc" class="avatar-image" :src="avatarSrc" alt="用户头像" />
              <div v-else class="avatar-fallback">{{ avatarText }}</div>
              <div class="avatar-overlay">
                <span class="avatar-overlay-text">点击更换头像</span>
              </div>
            </div>
          </el-upload>

          <div class="hero-content">
            <div class="hero-top">
              <div>
                <div class="hero-name">{{ displayName }}</div>
                <div class="hero-meta">账号：{{ profileForm.username || '未设置' }}</div>
              </div>

              <div class="hero-tags">
                <span class="tag primary">已实名</span>
                <span class="tag">{{ character }}</span>
              </div>
            </div>

            <div class="hero-stats">
              <div class="stat-item">
                <div class="stat-value">{{ infoSummary.joinDays }}</div>
                <div class="stat-label">加入天数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ infoSummary.collectionCount }}</div>
                <div class="stat-label">我的收藏</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ infoSummary.historyCount }}</div>
                <div class="stat-label">浏览记录</div>
              </div>
            </div>

            <div class="hero-desc">{{ profileForm.bio || '完善个人资料后，你可以更方便地管理账号信息、安全设置与个性化内容。' }}</div>
          </div>
        </div>
      </section>

      <section id="basic-section" class="card content-card">
        <div class="section-head">
          <div>
            <div class="section-title">基本资料</div>
            <div class="section-subtitle">维护你的公开信息与联系方式，方便平台为你提供更准确的服务。</div>
          </div>
          <button class="primary-btn edit-btn" type="button" @click="openEditDialog">编辑资料</button>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">昵称</div>
            <div class="info-value">{{ profileForm.name || '未设置' }}</div>
          </div>

          <div class="info-item">
            <div class="info-label">用户名</div>
            <div class="info-value">{{ profileForm.username || '未设置' }}</div>
          </div>

          <div class="info-item">
            <div class="info-label">手机号</div>
            <div class="info-value">{{ profileForm.phone || '未设置' }}</div>
          </div>

          <div class="info-item">
            <div class="info-label">邮箱</div>
            <div class="info-value">{{ profileForm.email || '未设置' }}</div>
          </div>

          <div class="info-item">
            <div class="info-label">所在城市</div>
            <div class="info-value">{{ profileForm.location || '未设置' }}</div>
          </div>

          <div class="info-item full-width">
            <div class="info-label">个性签名</div>
            <div class="info-value multiline">{{ profileForm.bio || '未设置' }}</div>
          </div>

          <div v-if="isExpert" class="info-item full-width">
            <div class="info-label">认证材料</div>
            <div class="info-value document-row">
              <span>{{ credentialFileName || '未上传认证材料' }}</span>
              <button
                v-if="credentialDownloadUrl"
                class="link-btn"
                type="button"
                @click="downloadCredential"
              >
                下载材料
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="security-section" class="card content-card">
        <div class="section-head">
          <div>
            <div class="section-title">安全设置</div>
            <div class="section-subtitle">通过多维度安全策略保护你的账号和个人信息。</div>
          </div>
        </div>

        <div class="security-list">
          <div v-for="item in securityItems" :key="item.title" class="security-item">
            <div class="security-main">
              <div class="security-icon" :class="item.theme">{{ item.icon }}</div>
              <div>
                <div class="security-title">{{ item.title }}</div>
                <div class="security-desc">{{ item.description }}</div>
              </div>
            </div>

            <div class="security-side">
              <span class="status-tag" :class="{ active: item.active }">{{ item.status }}</span>
              <button class="jump-btn" type="button">›</button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <EditPage
      v-model="editDialogVisible"
      :initial-data="editableProfile"
      :is-expert="isExpert"
      @save="handleProfileSave"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getAvatar, getCurrentUserCertificationMaterial, logoutRequest, uploadAvatar } from '@/api/user'
import { useAppStore } from '@/store/app'
import EditPage from './components/editPage.vue'

const appStore = useAppStore()
const activeNav = ref('profile')
const editDialogVisible = ref(false)

const navGroups = [
  {
    title: '账户管理',
    items: [
      { key: 'profile', label: '个人信息', icon: '👤' },
      { key: 'account', label: '账号设置', icon: '⚙' },
      { key: 'security', label: '安全中心', icon: '🔐' },
      { key: 'message', label: '消息通知', icon: '🔔', badge: '3' },
    ],
  },
  {
    title: '内容管理',
    items: [
      { key: 'favorite', label: '我的收藏', icon: '⭐' },
      { key: 'history', label: '浏览历史', icon: '🕘' },
      { key: 'download', label: '我的下载', icon: '⬇' },
    ],
  },
  {
    title: '交易管理',
    items: [
      { key: 'order', label: '订单管理', icon: '📦' },
      { key: 'invoice', label: '发票管理', icon: '🧾' },
      { key: 'wallet', label: '钱包余额', icon: '💳' },
    ],
  },
  {
    title: '帮助与支持',
    items: [
      { key: 'help', label: '帮助中心', icon: '❓' },
      { key: 'feedback', label: '意见反馈', icon: '✉' },
      { key: 'logout', label: '退出登录', icon: '↩' },
    ],
  },
]

const profileForm = reactive({
  name: '',
  username: '',
  phone: '',
  email: '',
  location: '',
  stage: '',
  bio: '',
  avatar: '',
  role: '',
  credentialName: '',
  credentialUrl: '',
})

const isExpert = computed(() => appStore.role === '专家')

const editableProfile = computed(() => ({
  name: profileForm.name,
  username: profileForm.username,
  phone: profileForm.phone,
  email: profileForm.email,
  location: profileForm.location,
  stage: profileForm.stage,
  bio: profileForm.bio,
  avatar: profileForm.avatar,
  role: profileForm.role,
  credentialName: profileForm.credentialName,
  credentialUrl: profileForm.credentialUrl,
}))

const displayName = computed(() => profileForm.name || profileForm.username || appStore.username || '游客')

const character = computed(() => appStore.role)

const avatarText = computed(() => {
  return String(displayName.value).trim().slice(0, 1).toUpperCase() || '游'
})

const avatarSrc = computed(() => {
  const rawAvatar = profileForm.avatar || appStore.userInfo?.avatar || ''
  if (!rawAvatar || typeof rawAvatar !== 'string') return ''

  const normalizedAvatar = rawAvatar.trim()
  if (!normalizedAvatar) return ''

  if (normalizedAvatar.startsWith('data:image')) return normalizedAvatar
  return `data:image/png;base64,${normalizedAvatar}`
})

const credentialFileName = computed(() => profileForm.credentialName || '')
const credentialDownloadUrl = computed(() => profileForm.credentialUrl || '')

const credentialObjectUrl = ref('')

function toDate(value) {
  if (value == null || value === '') return null

  if (typeof value === 'number' && Number.isFinite(value)) {
    const ms = value < 1e12 ? value * 1000 : value
    const date = new Date(ms)
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null

    if (/^\d+$/.test(trimmed)) {
      const num = Number(trimmed)
      if (!Number.isFinite(num)) return null
      const ms = num < 1e12 ? num * 1000 : num
      const date = new Date(ms)
      return Number.isNaN(date.getTime()) ? null : date
    }

    const date = new Date(trimmed)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const joinDays = computed(() => {
  const createdAt = toDate(appStore.userInfo?.createTime)
  if (!createdAt) return 0

  const diffMs = Date.now() - createdAt.getTime()
  if (!Number.isFinite(diffMs) || diffMs <= 0) return 0

  return Math.floor(diffMs / (24 * 60 * 60 * 1000))
})

const infoSummary = computed(() => ({
  joinDays: joinDays.value,
  collectionCount: appStore.userInfo?.collectionCount || 12,
  historyCount: appStore.userInfo?.historyCount || 36,
}))

const securityItems = computed(() => [
  {
    icon: '📱',
    title: '手机验证',
    description: `已绑定手机号：${profileForm.phone || '暂未绑定'}`,
    status: profileForm.phone ? '已绑定' : '未绑定',
    active: Boolean(profileForm.phone),
    theme: 'blue',
  },
  {
    icon: '✉',
    title: '邮箱验证',
    description: `已绑定邮箱：${profileForm.email || '暂未绑定'}`,
    status: profileForm.email ? '已绑定' : '未绑定',
    active: Boolean(profileForm.email),
    theme: 'purple',
  },
  {
    icon: '🛡',
    title: '两步验证',
    description: '开启后，登录除密码外还需要验证动态码',
    status: appStore.userInfo?.twoFactorEnabled ? '已开启' : '未开启',
    active: Boolean(appStore.userInfo?.twoFactorEnabled),
    theme: 'yellow',
  },
  {
    icon: '💻',
    title: '登录设备管理',
    description: '查看和管理登录过的设备，保护账号安全',
    status: '查看',
    active: false,
    theme: 'red',
  },
])

function fillProfileForm() {
  const userInfo = appStore.userInfo || {}

  profileForm.name = userInfo.nickname || userInfo.name || ''
  profileForm.username = userInfo.username || ''
  profileForm.phone = userInfo.phone || ''
  profileForm.email = userInfo.email || ''
  profileForm.location = userInfo.location || userInfo.city || userInfo.address || ''
  profileForm.bio = userInfo.bio || userInfo.signature || ''
  profileForm.avatar = userInfo.avatar || ''
  profileForm.role = appStore.role
  profileForm.credentialName = userInfo.credentialName || userInfo.authFileName || ''
  profileForm.credentialUrl = userInfo.credentialUrl || userInfo.authFileUrl || ''
}

fillProfileForm()

watch(
  () => appStore.userInfo,
  () => {
    fillProfileForm()
  },
  { deep: true }
)

watch(
  () => isExpert.value,
  (value) => {
    if (value) {
      loadCertificationMaterial()
    } else {
      clearCertificationMaterialUrl()
      profileForm.credentialName = ''
      profileForm.credentialUrl = ''
    }
  },
  { immediate: true }
)

function clearCertificationMaterialUrl() {
  if (credentialObjectUrl.value) {
    URL.revokeObjectURL(credentialObjectUrl.value)
    credentialObjectUrl.value = ''
  }
}

function inferCredentialFilename(blob) {
  const type = String(blob?.type || '').toLowerCase()
  if (type.includes('pdf')) return '认证材料.pdf'
  if (type.includes('msword')) return '认证材料.doc'
  if (type.includes('officedocument')) return '认证材料.docx'
  return '认证材料'
}

async function loadCertificationMaterial() {
  try {
    clearCertificationMaterialUrl()

    const blob = await getCurrentUserCertificationMaterial()
    if (!blob || typeof blob !== 'object' || typeof blob.size !== 'number' || blob.size <= 0) {
      profileForm.credentialName = ''
      profileForm.credentialUrl = ''
      return
    }

    const url = URL.createObjectURL(blob)
    credentialObjectUrl.value = url
    profileForm.credentialUrl = url
    profileForm.credentialName = profileForm.credentialName || inferCredentialFilename(blob)
  } catch (error) {
    profileForm.credentialName = ''
    profileForm.credentialUrl = ''
  }
}

onBeforeUnmount(() => {
  clearCertificationMaterialUrl()
})

function openEditDialog() {
  editDialogVisible.value = true
}

function handleProfileSave(payload) {
  Object.assign(profileForm, payload)

  appStore.setUserInfo({
    ...(appStore.userInfo || {}),
    nickname: payload.name,
    username: payload.username,
    phone: payload.phone,
    email: payload.email,
    location: payload.location,
    stage: payload.stage,
    bio: payload.bio,
    avatar: payload.avatar,
    credentialName: payload.credentialName,
    credentialUrl: payload.credentialUrl,
  })

  ElMessage.success('个人资料已更新')
}

function downloadCredential() {
  if (!credentialDownloadUrl.value) return
  const link = document.createElement('a')
  link.href = credentialDownloadUrl.value
  link.target = '_blank'
  link.rel = 'noopener'
  link.download = credentialFileName.value || '认证材料'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

async function handleNavClick(key) {
  activeNav.value = key

  if (key === 'logout') {
    try {
      await logoutRequest()
    } catch (error) {
    } finally {
      appStore.logout()
      ElMessage.success('已退出登录')
    }
    return
  }

  if (key === 'profile' || key === 'account') {
    document.getElementById('profile-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }

  if (key === 'security') {
    document.getElementById('security-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }

  ElMessage.info('该模块当前为静态展示')
}

function beforeAvatarUpload(file) {
  const isImage = typeof file?.type === 'string' && file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('仅支持上传图片格式')
    return false
  }

  const maxSizeMb = 5
  const isLt5M = typeof file?.size === 'number' ? file.size / 1024 / 1024 < maxSizeMb : true
  if (!isLt5M) {
    ElMessage.error(`图片大小不能超过 ${maxSizeMb}MB`)
    return false
  }

  return true
}

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

async function uploadAvatarRequest(options) {
  const file = options?.file
  if (!file) {
    options?.onError?.(new Error('未选择文件'))
    return
  }

  try {
    const result = await uploadAvatar(file)

    try {
      const avatarBlob = await getAvatar()
      if (avatarBlob && typeof avatarBlob === 'object' && typeof avatarBlob.size === 'number' && avatarBlob.size > 0) {
        const avatarDataUrl = await blobToDataUrl(avatarBlob)
        if (avatarDataUrl) {
          profileForm.avatar = avatarDataUrl
          appStore.setUserInfo({
            ...(appStore.userInfo || {}),
            avatar: avatarDataUrl,
          })
        }
      }
    } catch (error) {
    }

    options?.onSuccess?.(result)
    ElMessage.success('头像已更新')
  } catch (error) {
    options?.onError?.(error)
    ElMessage.error(error?.message || '头像上传失败')
  }
}
</script>

<style scoped>
.profile-page {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
  padding: 24px 0 40px;
}

.sidebar {
  position: sticky;
  top: 88px;
}

.sidebar-card,
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.sidebar-card {
  padding: 16px;
}

.nav-group + .nav-group {
  margin-top: 24px;
}

.nav-group-title {
  margin-bottom: 8px;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
}

.nav-item {
  width: 100%;
  border: none;
  background: transparent;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #334155;
  cursor: pointer;
  font-size: 14px;
}

.nav-item + .nav-item {
  margin-top: 4px;
}

.nav-item-left {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.nav-item.active {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 600;
}

.nav-item.danger {
  color: #dc2626;
}

.nav-icon {
  width: 20px;
  text-align: center;
}

.nav-badge {
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

.main-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-card,
.content-card {
  padding: 24px;
}

.profile-hero {
  display: flex;
  gap: 24px;
  align-items: center;
}

.avatar-wrap {
  position: relative;
  width: 96px;
  height: 96px;
  flex-shrink: 0;
  border: 4px solid #fff;
  border-radius: 999px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  overflow: hidden;
}

.avatar-uploader {
  display: inline-flex;
}

.avatar-uploader :deep(.el-upload) {
  display: inline-flex;
}

.avatar-image,
.avatar-fallback {
  width: 100%;
  height: 100%;
  border-radius: 999px;
}

.avatar-image {
  object-fit: cover;
}

.avatar-fallback {
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: #fff;
  font-size: 32px;
  font-weight: 800;
}

.avatar-wrap:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay {
  position: absolute;
  inset: -4px;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 999px;
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: pointer;
}

.avatar-overlay-text {
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  line-height: 1.4;
}

.hero-content {
  flex: 1;
  min-width: 0;
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.hero-name {
  font-size: 28px;
  line-height: 1.2;
  font-weight: 700;
  color: #0f172a;
}

.hero-meta,
.hero-desc {
  margin-top: 8px;
  color: #64748b;
  line-height: 1.6;
}

.hero-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
}

.tag.primary {
  background: #dbeafe;
  color: #2563eb;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.stat-item {
  border-radius: 12px;
  background: #f8fafc;
  padding: 14px 16px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.stat-label {
  margin-top: 6px;
  font-size: 13px;
  color: #64748b;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.section-subtitle {
  margin-top: 6px;
  font-size: 14px;
  color: #64748b;
}

.edit-btn {
  min-width: 120px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  background: #f8fafc;
}

.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.info-value {
  min-height: 22px;
  font-size: 14px;
  color: #0f172a;
}

.multiline {
  white-space: pre-wrap;
  line-height: 1.7;
}

.document-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.primary-btn,
.jump-btn {
  border: none;
  cursor: pointer;
}

.primary-btn {
  min-width: 160px;
  height: 44px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
}

.primary-btn {
  background: #2563eb;
  color: #fff;
}

.link-btn {
  border: none;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.security-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.security-item {
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.security-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.security-icon {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 18px;
}

.security-icon.blue {
  background: #eff6ff;
}

.security-icon.purple {
  background: #faf5ff;
}

.security-icon.yellow {
  background: #fffbeb;
}

.security-icon.red {
  background: #fef2f2;
}

.security-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.security-desc {
  margin-top: 4px;
  font-size: 13px;
  color: #64748b;
}

.security-side {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.status-tag.active {
  background: #dcfce7;
  color: #16a34a;
}

.jump-btn {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: transparent;
  color: #9ca3af;
  font-size: 20px;
}

@media (max-width: 1100px) {
  .profile-page {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .profile-hero,
  .hero-top,
  .security-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-stats,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .actions-row {
    flex-direction: column;
  }
}
</style>