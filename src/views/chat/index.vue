<template>
  <div class="chat-page">
    <div class="chat-shell">
      <aside class="conversation-sidebar">
        <div class="sidebar-header">会话</div>
        <button class="conversation-card active" type="button">
          <div class="conversation-avatar">
            <img v-if="targetAvatar" :src="targetAvatar" alt="用户头像" />
            <span v-else>{{ targetAvatarText }}</span>
          </div>
          <div class="conversation-main">
            <div class="conversation-name">{{ targetName }}</div>
            <div class="conversation-preview">{{ latestPreview }}</div>
          </div>
        </button>
      </aside>

      <section class="chat-main">
        <header class="chat-header">
          <button class="back-btn" type="button" @click="goBack">返回</button>
          <div class="chat-user">
            <div class="chat-avatar">
              <img v-if="targetAvatar" :src="targetAvatar" alt="用户头像" />
              <span v-else>{{ targetAvatarText }}</span>
            </div>
            <div>
              <div class="chat-name">{{ targetName }}</div>
              <div class="chat-subtitle">用户 ID：{{ targetUserId || '-' }}</div>
            </div>
          </div>
        </header>

        <div class="message-list">
          <div v-for="message in messages" :key="message.id" :class="['message-row', message.sender === 'self' ? 'self' : 'other']">
            <div class="message-bubble">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ message.time }}</div>
            </div>
          </div>
        </div>

        <footer class="composer">
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
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const draft = ref('')
const messages = ref([
  {
    id: 1,
    sender: 'other',
    content: '你好，我想和你交流一下。',
    time: '刚刚',
  },
])

const targetUserId = computed(() => String(route.query.targetUserId || '').trim())
const targetName = computed(() => String(route.query.targetName || '').trim() || '未知用户')
const targetAvatar = computed(() => {
  const rawAvatar = String(route.query.targetAvatar || '').trim()
  if (!rawAvatar) return ''
  if (rawAvatar.startsWith('data:image')) return rawAvatar
  if (rawAvatar.startsWith('http://') || rawAvatar.startsWith('https://') || rawAvatar.startsWith('/')) return rawAvatar
  return `data:image/png;base64,${rawAvatar}`
})
const targetAvatarText = computed(() => String(targetName.value).slice(0, 1).toUpperCase() || '聊')
const canSend = computed(() => Boolean(draft.value.trim()))
const latestPreview = computed(() => {
  const lastMessage = messages.value[messages.value.length - 1]
  return lastMessage?.content || '开始聊天吧'
})

function currentTimeText() {
  return new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function sendMessage() {
  const content = draft.value.trim()
  if (!content) return

  messages.value.push({
    id: Date.now(),
    sender: 'self',
    content,
    time: currentTimeText(),
  })

  draft.value = ''
}

function goBack() {
  router.back()
}
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
}

.sidebar-header {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.conversation-card {
  width: 100%;
  margin-top: 18px;
  border: none;
  border-radius: 16px;
  background: #eff6ff;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  text-align: left;
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
}

.conversation-name,
.chat-name {
  color: #0f172a;
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
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
