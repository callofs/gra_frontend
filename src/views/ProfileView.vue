<template>
  <div class="page">
    <div class="header">
      <div>
        <div class="title">个人中心</div>
        <div class="sub">资料卡片、我的学习/收藏（前端模拟数据）</div>
      </div>
      <button class="btn ghost" type="button" @click="reset">重置示例数据</button>
    </div>

    <div class="grid">
      <section class="card">
        <div class="card-title">我的资料</div>
        <div class="profile">
          <div class="avatar">{{ avatarText }}</div>
          <div class="info">
            <div class="name">{{ form.nickname }}</div>
            <div class="meta">{{ form.city }} · {{ form.role }}</div>
          </div>
        </div>

        <div class="form">
          <label class="field">
            <div class="label">昵称</div>
            <input v-model.trim="form.nickname" class="input" placeholder="请输入昵称" />
          </label>
          <label class="field">
            <div class="label">所在城市</div>
            <input v-model.trim="form.city" class="input" placeholder="例如：广州" />
          </label>
          <label class="field">
            <div class="label">身份</div>
            <select v-model="form.role" class="select">
              <option value="家长">家长</option>
              <option value="教师">教师</option>
              <option value="专家">专家</option>
            </select>
          </label>
          <label class="field">
            <div class="label">育儿关注点</div>
            <div class="chips">
              <button
                v-for="t in tags"
                :key="t"
                class="chip"
                :class="{ active: form.focus.includes(t) }"
                type="button"
                @click="toggleFocus(t)"
              >
                {{ t }}
              </button>
            </div>
          </label>

          <div class="row right">
            <button class="btn" type="button" @click="save">保存（本地）</button>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card-title">我的面板</div>

        <div class="stats">
          <div class="stat">
            <div class="k">论坛发帖</div>
            <div class="v">{{ stats.posts }}</div>
          </div>
          <div class="stat">
            <div class="k">评论</div>
            <div class="v">{{ stats.comments }}</div>
          </div>
          <div class="stat">
            <div class="k">收藏</div>
            <div class="v">{{ stats.favorites }}</div>
          </div>
          <div class="stat">
            <div class="k">课程进度</div>
            <div class="v">{{ stats.courseProgress }}%</div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="card-title" style="margin-top: 0">我的消息（示例）</div>
        <div class="messages">
          <div v-for="m in messages" :key="m.id" class="msg">
            <div class="m-row">
              <div class="m-title">{{ m.title }}</div>
              <div class="m-time">{{ m.time }}</div>
            </div>
            <div class="m-text">{{ m.text }}</div>
          </div>
        </div>
      </section>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const tags = ['情绪管理', '学习习惯', '营养喂养', '亲子沟通', '入园适应', '安全健康']

const toast = ref('')

const form = reactive(load() || defaultForm())

const avatarText = computed(() => {
  const n = form.nickname?.trim() || '用户'
  return n.slice(0, 1).toUpperCase()
})

const stats = reactive({
  posts: 3,
  comments: 12,
  favorites: 5,
  courseProgress: 40,
})

const messages = ref([
  {
    id: 'm1',
    title: '讲座提醒：儿童情绪管理今晚 19:30',
    time: '今天',
    text: '你预约的讲座即将开始，记得准时参加。',
  },
  {
    id: 'm2',
    title: '课程更新：亲子沟通入门新增 2 节',
    time: '2天前',
    text: '课程目录已更新，你可以继续学习。',
  },
])

function toggleFocus(t) {
  const idx = form.focus.indexOf(t)
  if (idx >= 0) form.focus.splice(idx, 1)
  else form.focus.push(t)
}

function save() {
  localStorage.setItem('demo_profile', JSON.stringify(form))
  notify('已保存到本地（示例）')
}

function reset() {
  Object.assign(form, defaultForm())
  localStorage.removeItem('demo_profile')
  notify('已重置（示例）')
}

function notify(text) {
  toast.value = text
  window.clearTimeout(notify._t)
  notify._t = window.setTimeout(() => {
    toast.value = ''
  }, 1800)
}

function defaultForm() {
  return {
    nickname: localStorage.getItem('demo_user') || '示例用户',
    city: '广州',
    role: '家长',
    focus: ['亲子沟通', '情绪管理'],
  }
}

function load() {
  try {
    const raw = localStorage.getItem('demo_profile')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (!Array.isArray(parsed.focus)) parsed.focus = []
    return parsed
  } catch {
    return null
  }
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.title {
  font-size: 20px;
  font-weight: 750;
  color: #0f172a;
}

.sub {
  margin-top: 4px;
  font-size: 13px;
  color: rgba(15, 23, 42, 0.7);
}

.btn {
  height: 38px;
  border-radius: 12px;
  border: none;
  background: #2563eb;
  color: #fff;
  padding: 0 14px;
  cursor: pointer;
  font-weight: 650;
}

.btn.ghost {
  background: rgba(15, 23, 42, 0.06);
  color: rgba(15, 23, 42, 0.86);
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.card {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  padding: 14px;
}

.card-title {
  font-weight: 900;
  color: rgba(15, 23, 42, 0.92);
  margin-bottom: 10px;
}

.profile {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-weight: 900;
  color: rgba(15, 23, 42, 0.86);
  background: linear-gradient(135deg, rgba(59,130,246,.22), rgba(34,197,94,.18));
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.info .name {
  font-weight: 900;
  color: rgba(15, 23, 42, 0.92);
}

.info .meta {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(15, 23, 42, 0.6);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 12px;
  color: rgba(15, 23, 42, 0.7);
  font-weight: 800;
}

.input {
  height: 38px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: #fff;
  padding: 0 12px;
  outline: none;
}

.select {
  height: 38px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: #fff;
  padding: 0 10px;
  outline: none;
}

.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(15, 23, 42, 0.03);
  padding: 6px 10px;
  border-radius: 999px;
  cursor: pointer;
  color: rgba(15, 23, 42, 0.82);
  font-size: 12px;
}

.chip.active {
  background: rgba(37, 99, 235, 0.1);
  border-color: rgba(37, 99, 235, 0.22);
  color: rgba(37, 99, 235, 0.95);
  font-weight: 800;
}

.row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.right {
  justify-content: flex-end;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.stat {
  background: rgba(15, 23, 42, 0.03);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 12px;
  padding: 12px;
}

.k {
  font-size: 12px;
  color: rgba(15, 23, 42, 0.58);
}

.v {
  margin-top: 6px;
  font-weight: 900;
  font-size: 18px;
  color: rgba(15, 23, 42, 0.92);
}

.divider {
  height: 1px;
  background: rgba(15, 23, 42, 0.08);
  margin: 12px 0;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.msg {
  background: rgba(15, 23, 42, 0.03);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 12px;
  padding: 12px;
}

.m-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.m-title {
  font-weight: 850;
  color: rgba(15, 23, 42, 0.9);
}

.m-time {
  font-size: 12px;
  color: rgba(15, 23, 42, 0.55);
}

.m-text {
  margin-top: 6px;
  color: rgba(15, 23, 42, 0.76);
  line-height: 1.6;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.92);
  color: #fff;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  z-index: 30;
}

@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
