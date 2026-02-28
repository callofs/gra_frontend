<template>
  <div class="page">
    <div class="header">
      <div>
        <div class="title">专家讲座</div>
        <div class="sub">讲座预告、回放列表（静态数据 + 预约/收藏模拟）</div>
      </div>
      <div class="actions">
        <select v-model="filter" class="select">
          <option value="all">全部</option>
          <option value="upcoming">即将开始</option>
          <option value="replay">可回放</option>
        </select>
        <input v-model.trim="keyword" class="input" placeholder="搜索讲座/专家" />
      </div>
    </div>

    <div class="list">
      <div v-for="l in filtered" :key="l.id" class="card">
        <div class="cover" :style="{ background: l.color }">
          <div class="cover-title">{{ l.topic }}</div>
          <div class="cover-sub">{{ l.expert }}</div>
        </div>
        <div class="body">
          <div class="row">
            <div class="name">{{ l.topic }}</div>
            <div class="pill" :class="l.type">{{ l.type === 'upcoming' ? '预告' : '回放' }}</div>
          </div>
          <div class="meta">
            <span>{{ l.expert }}</span>
            <span>·</span>
            <span>{{ l.time }}</span>
            <span v-if="l.duration">·</span>
            <span v-if="l.duration">{{ l.duration }}</span>
          </div>
          <div class="desc">{{ l.desc }}</div>

          <div class="row bottom">
            <div class="tags">
              <span v-for="t in l.tags" :key="t" class="tag">#{{ t }}</span>
            </div>
            <div class="ops">
              <button class="mini" type="button" @click="toggleFav(l)">
                {{ favs.has(l.id) ? '已收藏' : '收藏' }}
              </button>
              <button v-if="l.type === 'upcoming'" class="mini primary" type="button" @click="book(l)">
                {{ booked.has(l.id) ? '已预约' : '预约' }}
              </button>
              <button v-else class="mini primary" type="button" @click="play(l)">观看回放</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const filter = ref('all')
const keyword = ref('')
const toast = ref('')

const favs = reactive(new Set())
const booked = reactive(new Set())

const lectures = ref([
  {
    id: 201,
    topic: '儿童情绪管理：从“发脾气”到“会表达”',
    expert: '张医生（儿童心理）',
    time: '2026-03-05 19:30',
    duration: '60分钟',
    type: 'upcoming',
    tags: ['情绪', '亲子沟通'],
    color: 'linear-gradient(135deg, rgba(59,130,246,.22), rgba(14,165,233,.18))',
    desc: '识别情绪背后的需求，建立可执行的沟通与边界策略。',
  },
  {
    id: 202,
    topic: '科学喂养：挑食、偏食与营养搭配',
    expert: '李老师（营养师）',
    time: '2026-02-12 20:00',
    duration: '45分钟',
    type: 'replay',
    tags: ['营养', '挑食'],
    color: 'linear-gradient(135deg, rgba(34,197,94,.2), rgba(16,185,129,.18))',
    desc: '如何构建一日三餐结构，避免“零食替代正餐”的陷阱。',
  },
  {
    id: 203,
    topic: '幼小衔接：学习习惯与时间管理',
    expert: '周老师（小学班主任）',
    time: '2026-02-01 19:00',
    duration: '55分钟',
    type: 'replay',
    tags: ['习惯', '小学'],
    color: 'linear-gradient(135deg, rgba(244,63,94,.18), rgba(251,146,60,.18))',
    desc: '以“清单 + 计时器 + 复盘”建立可持续的学习节奏。',
  },
])

const filtered = computed(() => {
  let list = lectures.value
  if (filter.value !== 'all') list = list.filter((l) => l.type === filter.value)

  const k = keyword.value.toLowerCase()
  if (!k) return list

  return list.filter((l) => {
    return (
      l.topic.toLowerCase().includes(k) ||
      l.expert.toLowerCase().includes(k) ||
      l.tags.some((t) => t.toLowerCase().includes(k))
    )
  })
})

function toggleFav(l) {
  if (favs.has(l.id)) favs.delete(l.id)
  else favs.add(l.id)
}

function book(l) {
  if (booked.has(l.id)) return
  booked.add(l.id)
  notify('预约成功（示例）')
}

function play(l) {
  notify(`已模拟播放回放：${l.topic}`)
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

.list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

.cover {
  padding: 14px;
}

.cover-title {
  font-weight: 850;
  color: rgba(15, 23, 42, 0.9);
}

.cover-sub {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(15, 23, 42, 0.65);
}

.body {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.row.bottom {
  align-items: flex-end;
}

.name {
  font-weight: 800;
  color: rgba(15, 23, 42, 0.92);
}

.pill {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(15, 23, 42, 0.03);
}

.pill.upcoming {
  color: rgba(37, 99, 235, 0.95);
  background: rgba(37, 99, 235, 0.1);
  border-color: rgba(37, 99, 235, 0.22);
}

.pill.replay {
  color: rgba(21, 128, 61, 0.95);
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.22);
}

.meta {
  font-size: 12px;
  color: rgba(15, 23, 42, 0.6);
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.desc {
  font-size: 13px;
  color: rgba(15, 23, 42, 0.78);
  line-height: 1.6;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  font-size: 12px;
  color: rgba(59, 130, 246, 0.95);
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: 3px 8px;
  border-radius: 999px;
}

.ops {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.mini {
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(15, 23, 42, 0.03);
  padding: 6px 10px;
  border-radius: 10px;
  cursor: pointer;
  color: rgba(15, 23, 42, 0.82);
}

.mini.primary {
  background: rgba(37, 99, 235, 0.1);
  border-color: rgba(37, 99, 235, 0.22);
  color: rgba(37, 99, 235, 0.95);
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
  .list {
    grid-template-columns: 1fr;
  }

  .input {
    min-width: 160px;
  }
}
</style>
