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

    <component :is="currentViewComponent" ref="currentPanelRef" v-bind="currentViewProps" />

    <EditPage
      v-model="editDialogVisible"
      :initial-data="editableProfile"
      :is-expert="isExpert"
      @save="handleProfileSave"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getAvatar, getCurrentUserCertificationMaterial, logoutRequest, uploadAvatar } from '@/api/user'
import { useAppStore } from '@/store/app'
import EditPage from './components/editPage.vue'
import UtilityToolsPanel from './components/UtilityToolsPanel.vue'
import FavoritePanel from './components/FavoritePanel.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import DownloadPanel from './components/DownloadPanel.vue'
import DictAdminPanel from './components/DictAdminPanel.vue'
import OrderPanel from './components/OrderPanel.vue'
import InvoicePanel from './components/InvoicePanel.vue'
import WalletPanel from './components/WalletPanel.vue'
import HelpPanel from './components/HelpPanel.vue'
import FeedbackPanel from './components/FeedbackPanel.vue'
import MessagePanel from './components/MessagePanel.vue'
import ProfileContentPanel from './components/ProfileContentPanel.vue'

const appStore = useAppStore()
const activeNav = ref('profile')
const editDialogVisible = ref(false)
const currentPanelRef = ref(null)

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
      { key: 'utilityTools', label: '实用工具', icon: '🧰' },
      { key: 'favorite', label: '我的收藏', icon: '⭐' },
      { key: 'history', label: '浏览历史', icon: '🕘' },
      { key: 'download', label: '我的下载', icon: '⬇' },
      ...(appStore.role === '管理员'
        ? [{ key: 'dictAdmin', label: '模块管理', icon: '🧩' }]
        : []),
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

const navItemMap = computed(() => {
  return navGroups.flatMap((group) => group.items)
    .reduce((acc, item) => {
      acc[item.key] = item
      return acc
    }, {})
})

const navComponentMap = {
  profile: ProfileContentPanel,
  account: ProfileContentPanel,
  security: ProfileContentPanel,
  message: MessagePanel,
  utilityTools: UtilityToolsPanel,
  favorite: FavoritePanel,
  history: HistoryPanel,
  download: DownloadPanel,
  dictAdmin: DictAdminPanel,
  order: OrderPanel,
  invoice: InvoicePanel,
  wallet: WalletPanel,
  help: HelpPanel,
  feedback: FeedbackPanel,
}

const currentViewComponent = computed(() => {
  return navComponentMap[activeNav.value] || ProfileContentPanel
})

const currentViewProps = computed(() => {
  if (['profile', 'account', 'security'].includes(activeNav.value)) {
    return {
      avatarSrc: avatarSrc.value,
      avatarText: avatarText.value,
      displayName: displayName.value,
      character: character.value,
      profileForm,
      infoSummary: infoSummary.value,
      isExpert: isExpert.value,
      credentialFileName: credentialFileName.value,
      credentialDownloadUrl: credentialDownloadUrl.value,
      securityItems: securityItems.value,
      beforeAvatarUpload,
      uploadAvatarRequest,
      openEditDialog,
      downloadCredential,
    }
  }

  return {}
})

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

  activeNav.value = key

  if (['profile', 'account', 'security'].includes(key)) {
    await nextTick()
    currentPanelRef.value?.scrollToSection?.(key)
  }
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

@media (max-width: 1100px) {
  .profile-page {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .actions-row {
    flex-direction: column;
  }
}
</style>