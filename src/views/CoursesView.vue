<template>
  <div class="page">
    <div class="header">
      <div>
        <div class="title">在线课程</div>
        <div class="sub">课程目录、学习进度（本地状态模拟）</div>
      </div>
      <div class="actions">
        <select v-model="level" class="select">
          <option value="all">全部阶段</option>
          <option value="0-3">0-3岁</option>
          <option value="3-6">3-6岁</option>
          <option value="6+">6岁+</option>
        </select>
        <input v-model.trim="keyword" class="input" placeholder="搜索课程/讲师" />
      </div>
    </div>

    <div class="grid">
      <div v-for="c in filtered" :key="c.id" class="card">
        <div class="top" :style="{ background: c.color }">
          <div class="t-title">{{ c.title }}</div>
          <div class="t-sub">{{ c.teacher }} · {{ c.level }}</div>
        </div>
        <div class="body">
          <div class="desc">{{ c.desc }}</div>
          <div class="meta">
            <span>{{ c.lessons }} 课时</span>
            <span>·</span>
            <span>预计 {{ c.total }} 分钟</span>
          </div>

          <div class="progress">
            <div class="p-row">
              <div class="p-label">学习进度</div>
              <div class="p-val">{{ progressOf(c) }}%</div>
            </div>
            <div class="bar"><div class="fill" :style="{ width: progressOf(c) + '%' }"></div></div>
          </div>

          <div class="row">
            <button class="btn ghost" type="button" @click="toggleEnroll(c)">
              {{ enrolled.has(c.id) ? '已加入' : '加入学习' }}
            </button>
            <button class="btn" type="button" @click="learn(c)" :disabled="!enrolled.has(c.id)">
              开始学习
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showLearn" class="mask" @click.self="closeLearn">
      <div class="modal">
        <div class="m-title">{{ active?.title }}</div>
        <div class="m-sub">{{ active?.teacher }} · {{ active?.level }}</div>

        <div class="lesson">
          <div class="lesson-title">当前课时：第 {{ activeLesson }} 课</div>
          <div class="lesson-text">这里展示课程内容占位（纯前端演示）。</div>
        </div>

        <div class="row between">
          <button class="btn ghost" type="button" @click="prevLesson" :disabled="activeLesson <= 1">上一课</button>
          <button class="btn" type="button" @click="nextLesson" :disabled="activeLesson >= (active?.lessons || 1)">
            下一课
          </button>
        </div>

        <div class="row right">
          <button class="btn ghost" type="button" @click="closeLearn">关闭</button>
        </div>
      </div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const level = ref('all')
const keyword = ref('')
const toast = ref('')

const enrolled = reactive(new Set())
const progress = reactive(new Map())

const courses = ref([
  {
    id: 301,
    title: '亲子沟通入门：听懂孩子的“潜台词”',
    teacher: '陈老师',
    level: '3-6',
    lessons: 12,
    total: 180,
    color: 'linear-gradient(135deg, rgba(59,130,246,.22), rgba(99,102,241,.18))',
    desc: '用可执行的沟通框架减少冲突，提高配合度。',
  },
  {
    id: 302,
    title: '0-3岁睡眠与作息：建立可持续节律',
    teacher: '王医生',
    level: '0-3',
    lessons: 10,
    total: 150,
    color: 'linear-gradient(135deg, rgba(34,197,94,.2), rgba(16,185,129,.18))',
    desc: '拆解常见夜醒、入睡难问题，给出可落地方法。',
  },
  {
    id: 303,
    title: '小学生学习习惯：专注力与时间管理',
    teacher: '周老师',
    level: '6+',
    lessons: 14,
    total: 210,
    color: 'linear-gradient(135deg, rgba(244,63,94,.18), rgba(251,146,60,.18))',
    desc: '清单化目标与复盘机制，帮助孩子建立自我管理。',
  },
])

const filtered = computed(() => {
  let list = courses.value
  if (level.value !== 'all') list = list.filter((c) => c.level === level.value)

  const k = keyword.value.toLowerCase()
  if (!k) return list

  return list.filter((c) => {
    return c.title.toLowerCase().includes(k) || c.teacher.toLowerCase().includes(k)
  })
})

function progressOf(c) {
  return progress.get(c.id) || 0
}

function toggleEnroll(c) {
  if (enrolled.has(c.id)) {
    enrolled.delete(c.id)
    notify('已移出学习（示例）')
    return
  }
  enrolled.add(c.id)
  if (!progress.has(c.id)) progress.set(c.id, 0)
  notify('已加入学习（示例）')
}

const showLearn = ref(false)
const active = ref(null)
const activeLesson = ref(1)

function learn(c) {
  active.value = c
  showLearn.value = true
  const p = progressOf(c)
  const lesson = Math.max(1, Math.min(c.lessons, Math.ceil((p / 100) * c.lessons)))
  activeLesson.value = lesson
}

function prevLesson() {
  if (!active.value) return
  activeLesson.value = Math.max(1, activeLesson.value - 1)
  syncProgress()
}

function nextLesson() {
  if (!active.value) return
  activeLesson.value = Math.min(active.value.lessons, activeLesson.value + 1)
  syncProgress()
}

function syncProgress() {
  if (!active.value) return
  const p = Math.round((activeLesson.value / active.value.lessons) * 100)
  progress.set(active.value.id, p)
}

function closeLearn() {
  showLearn.value = false
  active.value = null
}

function notify(text) {
  toast.value = text
  window.clearTimeout(notify._t)
  notify._t = window.setTimeout(() => {
    toast.value = ''
  }, 1800)
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

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.select {
  height: 38px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: #fff;
  padding: 0 10px;
  outline: none;
}

.input {
  height: 38px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: #fff;
  padding: 0 12px;
  min-width: 240px;
  outline: none;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.card {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.top {
  padding: 14px;
}

.t-title {
  font-weight: 900;
  color: rgba(15, 23, 42, 0.9);
}

.t-sub {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(15, 23, 42, 0.65);
}

.body {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.desc {
  font-size: 13px;
  color: rgba(15, 23, 42, 0.78);
  line-height: 1.6;
  min-height: 44px;
}

.meta {
  font-size: 12px;
  color: rgba(15, 23, 42, 0.6);
  display: flex;
  gap: 6px;
}

.progress {
  background: rgba(15, 23, 42, 0.03);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 12px;
  padding: 10px;
}

.p-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.p-label {
  font-size: 12px;
  color: rgba(15, 23, 42, 0.7);
  font-weight: 700;
}

.p-val {
  font-size: 12px;
  color: rgba(37, 99, 235, 0.95);
  font-weight: 800;
}

.bar {
  margin-top: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.95), rgba(99, 102, 241, 0.9));
}

.row {
  display: flex;
  gap: 10px;
  align-items: center;
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
  flex: 1;
}

.btn.ghost {
  background: rgba(15, 23, 42, 0.06);
  color: rgba(15, 23, 42, 0.86);
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: grid;
  place-items: center;
  padding: 16px;
  z-index: 20;
}

.modal {
  width: min(720px, 100%);
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  padding: 14px;
}

.m-title {
  font-size: 16px;
  font-weight: 900;
  color: rgba(15, 23, 42, 0.92);
}

.m-sub {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(15, 23, 42, 0.62);
}

.lesson {
  margin-top: 12px;
  background: rgba(15, 23, 42, 0.03);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 14px;
  padding: 12px;
}

.lesson-title {
  font-weight: 850;
  color: rgba(15, 23, 42, 0.9);
}

.lesson-text {
  margin-top: 8px;
  color: rgba(15, 23, 42, 0.76);
  line-height: 1.7;
}

.between {
  justify-content: space-between;
}

.right {
  justify-content: flex-end;
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

  .input {
    min-width: 160px;
  }
}
</style>
