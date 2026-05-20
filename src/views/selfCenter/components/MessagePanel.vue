<template>
  <section class="feature-panel card">
    <div class="feature-header">
      <div class="feature-icon">🔔</div>
      <div>
        <div class="feature-title">消息通知</div>
        <div class="feature-subtitle">查看别人发来的私信与最近会话动态。</div>
      </div>
    </div>

    <div class="feature-grid">
      <button class="feature-item feature-item-action" type="button" @click="openChatPanel">
        <div class="feature-label">未读消息</div>
        <div class="feature-value">{{ unreadCountText }}</div>
      </button>

      <div class="feature-item">
        <div class="feature-label">私信会话</div>
        <div class="feature-value">{{ conversationCountText }}</div>
      </div>

      <div class="feature-item feature-item-wide">
        <div class="feature-label">最新消息</div>
        <div class="feature-value feature-value-text">{{ latestMessageText }}</div>
      </div>

      <div class="feature-item">
        <div class="feature-label">最近更新</div>
        <div class="feature-value">{{ latestUpdateText }}</div>
      </div>
    </div>

    <div class="feature-footer">{{ footerText }}</div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { addPrivateMessageSocketListeners, createPrivateMessageSocket, getConversationList, getUnreadPrivateMessageCount, getPrivateMessageSocket } from '@/api/chat'

const router = useRouter()
const unreadCount = ref(0)
const conversations = ref([])
const loading = ref(false)
const errorMessage = ref('')
let removeSocketListeners = null

const latestConversation = computed(() => {
  return conversations.value[0] || null
})

const unreadConversation = computed(() => {
  return conversations.value.find((item) => Number(item?.unreadCount || 0) > 0) || latestConversation.value || null
})

const unreadCountText = computed(() => `${unreadCount.value} 条`)

const conversationCountText = computed(() => `${conversations.value.length} 个`)

const latestMessageText = computed(() => {
  const content = String(latestConversation.value?.lastMessageContent || '').trim()
  return content || '暂无新消息'
})

const latestUpdateText = computed(() => {
  return formatRelativeTime(latestConversation.value?.lastMessageTime)
})

const footerText = computed(() => {
  if (loading.value) return '私信消息加载中...'
  if (errorMessage.value) return errorMessage.value
  if (!conversations.value.length) return '当前还没有私信记录，收到新消息后会显示在这里。'

  const targetName = unreadConversation.value?.targetNickname || '联系人'
  if (unreadCount.value > 0) {
    return `你有 ${unreadCount.value} 条未读私信，点击“未读消息”可立即进入与 ${targetName} 的聊天界面。`
  }

  return `最近一次私信来自 ${targetName}，点击“未读消息”可进入聊天界面查看全部会话。`
})

function normalizeListResponse(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.records)) return payload.records
  if (Array.isArray(payload?.data?.records)) return payload.data.records
  if (Array.isArray(payload?.data?.list)) return payload.data.list
  if (Array.isArray(payload?.list)) return payload.list
  return []
}

function normalizeCountResponse(payload) {
  if (typeof payload === 'number') return payload
  if (typeof payload?.data === 'number') return payload.data
  if (typeof payload?.count === 'number') return payload.count
  if (typeof payload?.data?.count === 'number') return payload.data.count
  if (typeof payload?.data?.unreadCount === 'number') return payload.data.unreadCount
  if (typeof payload?.unreadCount === 'number') return payload.unreadCount
  return Number(payload?.data ?? payload ?? 0) || 0
}

function sortConversations(list) {
  return [...list].sort((a, b) => {
    const timeA = new Date(a?.lastMessageTime || 0).getTime()
    const timeB = new Date(b?.lastMessageTime || 0).getTime()
    return timeB - timeA
  })
}

function upsertConversationByMessage(message) {
  const targetId = String(message?.senderId || '')
  if (!targetId) return

  const existing = conversations.value.find((item) => String(item.targetUserId) === targetId)
  const nextConversation = {
    ...(existing || {}),
    targetUserId: targetId,
    targetNickname: existing?.targetNickname || String(message?.senderNickname || '').trim() || `用户${targetId}`,
    targetAvatar: existing?.targetAvatar || '',
    lastSenderId: message?.senderId,
    lastMessageType: message?.msgType,
    lastMessageContent: message?.content || '',
    lastMessageTime: message?.createTime || '',
    unreadCount: Number(message?.senderId) ? Number(existing?.unreadCount || 0) + 1 : Number(existing?.unreadCount || 0),
  }

  conversations.value = sortConversations([
    nextConversation,
    ...conversations.value.filter((item) => String(item.targetUserId) !== targetId),
  ])
}

function handleSocketMessage(payload) {
  if (!payload || typeof payload !== 'object') return

  if (payload.event === 'connected') {
    unreadCount.value = Number(payload.unreadCount || unreadCount.value || 0)
    return
  }

  if (payload.event !== 'message' || !payload.data) return

  upsertConversationByMessage(payload.data)

  if (payload.unreadCount !== null && payload.unreadCount !== undefined) {
    unreadCount.value = Number(payload.unreadCount || 0)
    return
  }

  unreadCount.value += 1
}

function initSocket() {
  ensurePrivateMessageConnection()
  removeSocketListeners?.()
  removeSocketListeners = addPrivateMessageSocketListeners({
    onMessage(payload) {
      handleSocketMessage(payload)
    },
  })
}

function ensurePrivateMessageConnection() {
  const socket = getPrivateMessageSocket()
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return socket
  }

  return createPrivateMessageSocket()
}

async function fetchMessageOverview() {
  loading.value = true
  errorMessage.value = ''

  try {
    const [conversationRes, unreadRes] = await Promise.all([
      getConversationList(),
      getUnreadPrivateMessageCount(),
    ])

    conversations.value = sortConversations(normalizeListResponse(conversationRes))
    unreadCount.value = normalizeCountResponse(unreadRes)
  } catch (error) {
    conversations.value = []
    unreadCount.value = 0
    errorMessage.value = error?.message || '私信消息加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

function openChatPanel() {
  try {
    ensurePrivateMessageConnection()
  } catch (error) {
  }

  const target = unreadConversation.value
  if (target?.targetUserId) {
    router.push({
      name: 'chat',
      query: {
        targetUserId: String(target.targetUserId),
        targetName: target.targetNickname || '',
        targetAvatar: target.targetAvatar || '',
      },
    })
    return
  }

  router.push({
    name: 'chat',
  })
}

function formatRelativeTime(value) {
  if (!value) return '-'

  const date = new Date(value)
  const time = date.getTime()
  if (Number.isNaN(time)) return '-'

  const diff = Date.now() - time
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`

  return String(value).replace('T', ' ').slice(0, 16)
}

onMounted(() => {
  fetchMessageOverview()
  initSocket()
})

onBeforeUnmount(() => {
  removeSocketListeners?.()
  removeSocketListeners = null
})
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.feature-panel {
  padding: 24px;
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: #eff6ff;
  font-size: 28px;
}

.feature-title {
  font-size: 24px;
  line-height: 1.3;
  font-weight: 700;
  color: #0f172a;
}

.feature-subtitle {
  margin-top: 6px;
  font-size: 14px;
  color: #64748b;
}

.feature-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.feature-item {
  padding: 18px;
  border-radius: 12px;
  background: #f8fafc;
  border: none;
  text-align: left;
}

.feature-item-action {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.feature-item-action:hover {
  background: #eff6ff;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.12);
  transform: translateY(-1px);
}

.feature-item-wide {
  grid-column: 1 / -1;
}

.feature-label {
  font-size: 13px;
  color: #64748b;
}

.feature-value {
  margin-top: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.feature-value-text {
  line-height: 1.6;
  word-break: break-word;
}

.feature-footer {
  margin-top: 24px;
  padding: 16px 18px;
  border-radius: 12px;
  background: #eff6ff;
  color: #475569;
  line-height: 1.8;
  font-size: 14px;
}

@media (max-width: 768px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }

  .feature-item-wide {
    grid-column: auto;
  }
}
</style>
