<template>
  <div class="chat-page">
    <div class="chat-shell">
      <aside class="conversation-sidebar">
        <div class="sidebar-top">
          <div class="sidebar-header">会话</div>
          <div class="sidebar-badge">未读 {{ unreadCount }}</div>
        </div>
        <div v-if="conversationLoading" class="sidebar-state">会话加载中...</div>
        <div v-else-if="!conversations.length" class="sidebar-state">暂无会话</div>
        <button
          v-for="conversation in conversations"
          :key="conversation.targetUserId"
          :class="['conversation-card', activeConversationId === String(conversation.targetUserId) ? 'active' : '']"
          type="button"
          @click="selectConversation(conversation)"
        >
          <div class="conversation-avatar">
            <img v-if="conversation.targetAvatar" :src="conversation.targetAvatar" alt="用户头像" />
            <span v-else>{{ getAvatarText(conversation.targetNickname) }}</span>
          </div>
          <div class="conversation-main">
            <div class="conversation-row">
              <div class="conversation-name">{{ conversation.targetNickname || '未知用户' }}</div>
              <div v-if="conversation.unreadCount" class="conversation-unread">{{ conversation.unreadCount }}</div>
            </div>
            <div class="conversation-preview">{{ conversation.lastMessageContent || '开始聊天吧' }}</div>
          </div>
        </button>
      </aside>

      <section class="chat-main">
        <header v-if="activeConversation" class="chat-header">
          <button class="back-btn" type="button" @click="goBack">返回</button>
          <div class="chat-user">
            <div class="chat-avatar">
              <img v-if="targetAvatar" :src="targetAvatar" alt="用户头像" />
              <span v-else>{{ targetAvatarText }}</span>
            </div>
            <div>
              <div class="chat-name">{{ targetName }}</div>
              <div class="chat-subtitle">用户 ID：{{ targetUserId || '-' }} · {{ socketStatusText }}</div>
            </div>
          </div>
        </header>

        <div v-else class="empty-chat-state">请选择一个会话开始聊天</div>

        <div v-if="activeConversation" ref="messageListRef" class="message-list">
          <div v-if="messageLoading" class="message-state">消息加载中...</div>
          <div v-else-if="!messages.length" class="message-state">暂无聊天记录，发一条消息开始聊天吧</div>
          <div v-for="message in messages" :key="message.id" :class="['message-row', message.sender === 'self' ? 'self' : 'other']">
            <div class="message-bubble">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ message.time }}</div>
            </div>
          </div>
        </div>

        <footer v-if="activeConversation" class="composer">
          <textarea
            v-model="draft"
            class="composer-input"
            placeholder="请输入消息内容..."
            rows="4"
            @keydown.enter.exact.prevent="sendMessage"
          />
          <div class="composer-actions">
            <div class="hint">按 Enter 发送，Shift + Enter 换行</div>
            <button class="send-btn" type="button" :disabled="!canSend" @click="sendMessage">发送</button>
          </div>
        </footer>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store/app'
import {
  addPrivateMessageSocketListeners,
  createPrivateMessageSocket,
  getConversationList,
  getMessagePage,
  getPrivateMessageSocket,
  getUnreadPrivateMessageCount,
  markPrivateConversationRead,
  sendPrivateMessage,
  sendPrivateMessageBySocket,
  waitForPrivateMessageSocketOpen,
} from '@/api/chat'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const draft = ref('')
const messages = ref([])
const conversations = ref([])
const unreadCount = ref(0)
const activeConversationId = ref(String(route.query.targetUserId || '').trim())
const conversationLoading = ref(false)
const messageLoading = ref(false)
const socketConnected = ref(false)
const messageListRef = ref(null)
let removeSocketListeners = null

const activeConversation = computed(() => {
  return conversations.value.find((item) => String(item.targetUserId) === activeConversationId.value) || null
})

const targetUserId = computed(() => String(activeConversation.value?.targetUserId || '').trim())
const targetName = computed(() => String(activeConversation.value?.targetNickname || route.query.targetName || '').trim() || '未知用户')
const targetAvatar = computed(() => normalizeAvatar(activeConversation.value?.targetAvatar || route.query.targetAvatar || ''))
const targetAvatarText = computed(() => getAvatarText(targetName.value))
const canSend = computed(() => Boolean(draft.value.trim()))
const socketStatusText = computed(() => {
  return socketConnected.value ? '在线连接中' : '连接已断开'
})

function normalizeAvatar(value) {
  const rawAvatar = String(value || '').trim()
  if (!rawAvatar) return ''
  if (rawAvatar.startsWith('data:image')) return rawAvatar
  if (rawAvatar.startsWith('http://') || rawAvatar.startsWith('https://') || rawAvatar.startsWith('/')) return rawAvatar
  return `data:image/png;base64,${rawAvatar}`
}

function getAvatarText(name) {
  return String(name || '').slice(0, 1).toUpperCase() || '聊'
}

function currentTimeText() {
  return new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatMessageTime(value) {
  if (!value) return currentTimeText()
  return String(value).replace('T', ' ').slice(0, 16)
}

function mapMessage(dto) {
  const currentUserId = String(appStore.userInfo?.id || '')
  return {
    id: dto.id,
    sender: String(dto.senderId) === currentUserId ? 'self' : 'other',
    senderId: dto.senderId,
    receiverId: dto.receiverId,
    content: dto.content || '',
    msgType: dto.msgType,
    time: formatMessageTime(dto.createTime),
  }
}

async function scrollToBottom() {
  await nextTick()
  const el = messageListRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

function mergeRouteConversation() {
  const routeTargetUserId = String(route.query.targetUserId || '').trim()
  if (!routeTargetUserId) return

  const exists = conversations.value.some((item) => String(item.targetUserId) === routeTargetUserId)
  if (exists) return

  conversations.value.unshift({
    targetUserId: routeTargetUserId,
    targetNickname: String(route.query.targetName || '').trim() || '未知用户',
    targetAvatar: normalizeAvatar(route.query.targetAvatar || ''),
    lastMessageContent: '',
    lastMessageTime: '',
    unreadCount: 0,
  })
}

async function loadUnreadCount() {
  try {
    const count = await getUnreadPrivateMessageCount()
    unreadCount.value = Number(count || 0)
  } catch (error) {
    unreadCount.value = 0
  }
}

async function loadConversations() {
  conversationLoading.value = true

  try {
    const list = await getConversationList()
    conversations.value = Array.isArray(list)
      ? list.map((item) => ({
        ...item,
        targetAvatar: normalizeAvatar(item.targetAvatar || ''),
      }))
      : []

    mergeRouteConversation()

    if (!activeConversationId.value && conversations.value.length) {
      activeConversationId.value = String(conversations.value[0].targetUserId)
    }
  } finally {
    conversationLoading.value = false
  }
}

async function loadMessages(targetId) {
  if (!targetId) {
    messages.value = []
    return
  }

  messageLoading.value = true

  try {
    const pageData = await getMessagePage(targetId, 1, 50)
    messages.value = Array.isArray(pageData?.records) ? pageData.records.map(mapMessage) : []
    await scrollToBottom()
  } finally {
    messageLoading.value = false
  }
}

async function markConversationRead(targetId) {
  if (!targetId) return

  try {
    const updatedCount = await markPrivateConversationRead(targetId)
    const countNumber = Number(updatedCount || 0)
    unreadCount.value = Math.max(0, unreadCount.value - countNumber)
    conversations.value = conversations.value.map((item) => {
      if (String(item.targetUserId) !== String(targetId)) return item
      return {
        ...item,
        unreadCount: 0,
      }
    })
  } catch (error) {
  }
}

async function selectConversation(conversation) {
  const targetId = String(conversation.targetUserId || '')
  if (!targetId) return

  activeConversationId.value = targetId
  router.replace({
    name: 'chat',
    query: {
      targetUserId: targetId,
      targetName: conversation.targetNickname || '',
      targetAvatar: conversation.targetAvatar || '',
    },
  })

  await loadMessages(targetId)
  await markConversationRead(targetId)
}

function upsertConversationByMessage(message) {
  const currentUserId = String(appStore.userInfo?.id || '')
  const targetId = String(message.senderId) === currentUserId ? String(message.receiverId) : String(message.senderId)
  const routeTargetId = String(route.query.targetUserId || '')
  const existing = conversations.value.find((item) => String(item.targetUserId) === targetId)
  const baseName = existing?.targetNickname || (targetId === routeTargetId ? String(route.query.targetName || '').trim() : '') || `用户${targetId}`
  const baseAvatar = existing?.targetAvatar || (targetId === routeTargetId ? normalizeAvatar(route.query.targetAvatar || '') : '')

  const nextConversation = {
    ...(existing || {}),
    targetUserId: targetId,
    targetNickname: baseName,
    targetAvatar: baseAvatar,
    lastSenderId: message.senderId,
    lastMessageType: message.msgType,
    lastMessageContent: message.content || '',
    lastMessageTime: message.createTime || '',
    unreadCount: String(activeConversationId.value) === targetId || String(message.senderId) === currentUserId
      ? 0
      : Number(existing?.unreadCount || 0) + 1,
  }

  conversations.value = [
    nextConversation,
    ...conversations.value.filter((item) => String(item.targetUserId) !== targetId),
  ]
}

function handleSocketMessage(payload) {
  if (!payload || typeof payload !== 'object') return

  if (payload.event === 'connected') {
    socketConnected.value = true
    unreadCount.value = Number(payload.unreadCount || unreadCount.value || 0)
    return
  }

  if (payload.event === 'error') {
    return
  }

  if (payload.event !== 'message' || !payload.data) return

  const dto = payload.data
  upsertConversationByMessage(dto)

  const currentUserId = String(appStore.userInfo?.id || '')
  const targetId = String(dto.senderId) === currentUserId ? String(dto.receiverId) : String(dto.senderId)

  if (targetId === String(activeConversationId.value)) {
    const exists = messages.value.some((item) => String(item.id) === String(dto.id))
    if (!exists) {
      messages.value.push(mapMessage(dto))
      scrollToBottom()
    }

    if (String(dto.senderId) !== currentUserId) {
      markConversationRead(targetId)
    }
  }

  if (payload.unreadCount !== null && payload.unreadCount !== undefined) {
    unreadCount.value = Number(payload.unreadCount || 0)
  }
}

function initSocket() {
  const exists = getPrivateMessageSocket()
  if (!exists) {
    createPrivateMessageSocket()
  }

  removeSocketListeners?.()
  removeSocketListeners = addPrivateMessageSocketListeners({
    onOpen() {
      socketConnected.value = true
    },
    onMessage(payload) {
      handleSocketMessage(payload)
    },
    onClose() {
      socketConnected.value = false
    },
    onError() {
      socketConnected.value = false
    },
  })
}

async function bootstrap() {
  await Promise.all([loadConversations(), loadUnreadCount()])
  initSocket()

  if (activeConversationId.value) {
    await loadMessages(activeConversationId.value)
    await markConversationRead(activeConversationId.value)
  }
}

async function sendMessage() {
  const content = draft.value.trim()
  const receiverId = targetUserId.value
  if (!content || !receiverId) return

  const payload = {
    action: 'send',
    receiverId: Number(receiverId),
    msgType: 1,
    content,
  }

  try {
    await waitForPrivateMessageSocketOpen()
    sendPrivateMessageBySocket(payload)
    draft.value = ''
  } catch (error) {
    const sent = await sendPrivateMessage({
      receiverId: Number(receiverId),
      msgType: 1,
      content,
    })

    const mapped = mapMessage(sent)
    messages.value.push(mapped)
    upsertConversationByMessage(sent)
    draft.value = ''
    await scrollToBottom()
  }
}

function goBack() {
  router.back()
}

onMounted(() => {
  bootstrap()
})

onBeforeUnmount(() => {
  removeSocketListeners?.()
  removeSocketListeners = null
})

watch(
  () => route.query.targetUserId,
  async (value) => {
    const nextId = String(value || '').trim()
    if (!nextId || nextId === activeConversationId.value) return

    activeConversationId.value = nextId
    mergeRouteConversation()
    await loadMessages(nextId)
    await markConversationRead(nextId)
  }
)
</script>

<style scoped>
.chat-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24px 0 48px;
}

.chat-shell {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
}

.conversation-sidebar,
.chat-main {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
}

.conversation-sidebar {
  padding: 20px;
  height: calc(100vh - 72px);
  position: sticky;
  top: 24px;
  overflow: auto;
}

.sidebar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sidebar-header {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.sidebar-badge {
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
}

.sidebar-state,
.message-state,
.empty-chat-state {
  display: grid;
  place-items: center;
  color: #64748b;
}

.sidebar-state {
  min-height: 180px;
}

.conversation-card {
  width: 100%;
  margin-top: 18px;
  border: none;
  border-radius: 16px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  text-align: left;
  cursor: pointer;
}

.conversation-card.active {
  background: #eff6ff;
}

.conversation-avatar,
.chat-avatar {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  overflow: hidden;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
  flex-shrink: 0;
}

.conversation-avatar img,
.chat-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.conversation-main {
  min-width: 0;
  flex: 1;
}

.conversation-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.conversation-name,
.chat-name {
  color: #0f172a;
  font-weight: 700;
}

.conversation-unread {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.conversation-preview,
.chat-subtitle,
.hint,
.message-time {
  color: #64748b;
  font-size: 13px;
}

.conversation-preview {
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-main {
  min-height: calc(100vh - 72px);
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.empty-chat-state {
  min-height: calc(100vh - 72px);
  background: #fff;
  border-radius: 20px;
}

.chat-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
  border-radius: 10px;
  height: 38px;
  padding: 0 14px;
  cursor: pointer;
}

.chat-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.message-list {
  padding: 24px;
  max-height: 520px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-state {
  min-height: 180px;
}

.message-row {
  display: flex;
}

.message-row.self {
  justify-content: flex-end;
}

.message-bubble {
  max-width: min(520px, 80%);
  padding: 14px 16px;
  border-radius: 18px;
  background: #f1f5f9;
}

.message-row.self .message-bubble {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
}

.message-row.self .message-time {
  color: rgba(255, 255, 255, 0.78);
}

.message-text {
  white-space: pre-wrap;
  line-height: 1.7;
}

.message-time {
  margin-top: 8px;
}

.composer {
  border-top: 1px solid #e2e8f0;
  padding: 20px 24px 24px;
}

.composer-input {
  width: 100%;
  resize: none;
  border: 1px solid #cbd5e1;
  border-radius: 16px;
  padding: 14px 16px;
  outline: none;
  font: inherit;
  color: #0f172a;
}

.composer-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.composer-actions {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.send-btn {
  min-width: 96px;
  height: 40px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.send-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 960px) {
  .chat-shell {
    grid-template-columns: 1fr;
  }

  .conversation-sidebar {
    height: auto;
    position: static;
  }
}
</style>
