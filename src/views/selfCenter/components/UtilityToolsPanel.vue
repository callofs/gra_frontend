<template>
  <section class="tools-panel card">
    <div class="category-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="tab"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.name }}
      </button>
    </div>

    <div class="tool-grid">
      <article v-for="tool in filteredTools" :key="tool.id" class="tool-card">
        <div class="tool-card-inner">
          <div class="tool-top">
            <div class="tool-icon" :class="tool.theme">{{ tool.icon }}</div>
            <button type="button" class="use-btn" @click="handleUse(tool)">立即使用</button>
          </div>

          <div class="tool-title">{{ tool.title }}</div>
          <div class="tool-desc">{{ tool.desc }}</div>

          <div class="tool-footer">
            <div class="tool-meta">
              <span class="meta-icon">👥</span>
            </div>
            <div class="tool-meta rating">
              <span class="meta-icon">⭐</span>
              <span>{{ tool.rating }}</span>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div class="recent-section">
      <div class="section-title">最近使用</div>
      <div class="recent-grid">
        <article v-for="item in recentTools" :key="item.id" class="recent-card">
          <div class="recent-header">
            <div class="recent-icon" :class="item.theme">{{ item.icon }}</div>
            <div>
              <div class="recent-title">{{ item.title }}</div>
              <div class="recent-time">上次使用：{{ item.lastUsed }}</div>
            </div>
          </div>

          <div class="recent-block-title">{{ item.blockTitle }}</div>

          <div class="recent-list">
            <div v-for="entry in item.entries" :key="entry.label" class="recent-item">
              <span class="recent-item-label" :class="entry.highlight ? 'highlight' : ''">{{ entry.label }}</span>
              <span class="recent-item-value" :class="entry.highlight ? 'highlight' : entry.done ? 'success' : ''">
                {{ entry.value }}
              </span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'

const tabs = [
  { key: 'all', name: '全部工具' },
  { key: 'record', name: '成长记录' },
  { key: 'health', name: '健康管理' },
  { key: 'study', name: '学习教育' },
  { key: 'life', name: '生活服务' },
  { key: 'writing', name: '记录写作' },
]

const activeTab = ref('all')

const tools = [
  {
    id: 1,
    category: 'record',
    icon: '😊',
    title: '心情笔记',
    desc: '记录育儿过程中的心情点滴，舒缓育儿压力，见证自我成长。支持私密记录和选择性分享。',
    users: '128万人使用',
    rating: '4.9',
    theme: 'orange',
  },
  {
    id: 2,
    category: 'health',
    icon: '💉',
    title: '疫苗提醒',
    desc: '根据孩子月龄生成接种提醒，提前通知待接种项目，减少错过疫苗时间的风险。',
    users: '96万人使用',
    rating: '4.8',
    theme: 'green',
  },
  {
    id: 3,
    category: 'study',
    icon: '📚',
    title: '绘本清单',
    desc: '按年龄与主题推荐适合的亲子绘本，帮助建立阅读习惯，提升孩子语言与认知能力。',
    users: '87万人使用',
    rating: '4.9',
    theme: 'blue',
  },
  {
    id: 4,
    category: 'life',
    icon: '🗓️',
    title: '家庭日程',
    desc: '统一管理体检、接送、课程与家庭事务安排，让育儿与生活节奏更有序。',
    users: '74万人使用',
    rating: '4.7',
    theme: 'purple',
  },
  {
    id: 5,
    category: 'writing',
    icon: '✍️',
    title: '育儿心得',
    desc: '沉淀你的育儿经验与方法论，支持整理为长文，便于自我复盘或分享给更多家长。',
    users: '53万人使用',
    rating: '4.8',
    theme: 'pink',
  },
  {
    id: 6,
    category: 'record',
    icon: '📏',
    title: '成长曲线',
    desc: '记录身高、体重与头围等关键指标，对照成长曲线，持续跟踪孩子发育变化。',
    users: '65万人使用',
    rating: '4.8',
    theme: 'cyan',
  },
  {
    id: 7,
    category: 'health',
    icon: '🥗',
    title: '营养计划',
    desc: '结合年龄阶段给出饮食建议与营养搭配提醒，帮助解决挑食、偏食等常见问题。',
    users: '58万人使用',
    rating: '4.7',
    theme: 'emerald',
  },
  {
    id: 8,
    category: 'study',
    icon: '🧠',
    title: '专注力训练',
    desc: '提供日常小游戏与训练建议，帮助提升专注力、规则意识与学习准备能力。',
    users: '49万人使用',
    rating: '4.8',
    theme: 'indigo',
  },
]

const recentTools = [
  {
    id: 1,
    icon: '✍️',
    title: '育儿心得',
    lastUsed: '1周前',
    blockTitle: '最近记录',
    theme: 'purple',
    entries: [
      { label: '如何培养孩子的阅读习惯', value: '1周前' },
      { label: '三岁孩子叛逆期应对方法', value: '2周前' },
    ],
  },
  {
    id: 2,
    icon: '💉',
    title: '疫苗提醒',
    lastUsed: '2周前',
    blockTitle: '即将接种',
    theme: 'green',
    entries: [
      { label: '流感疫苗 · 还有3天', value: '待接种', highlight: true },
      { label: '乙肝疫苗第三针', value: '已接种', done: true },
    ],
  },
  {
    id: 3,
    icon: '😊',
    title: '心情笔记',
    lastUsed: '3天前',
    blockTitle: '最近心情',
    theme: 'orange',
    entries: [
      { label: '今天第一次自己收拾玩具', value: '已保存' },
      { label: '夜醒减少，状态轻松很多', value: '昨天' },
    ],
  },
  {
    id: 4,
    icon: '📚',
    title: '绘本清单',
    lastUsed: '5天前',
    blockTitle: '本周书单',
    theme: 'blue',
    entries: [
      { label: '《猜猜我有多爱你》', value: '已加入' },
      { label: '《大卫，不可以》', value: '推荐中' },
    ],
  },
]

const filteredTools = computed(() => {
  if (activeTab.value === 'all') return tools
  return tools.filter((tool) => tool.category === activeTab.value)
})

function handleUse(tool) {
  ElMessage.info(`打开工具：${tool.title}（待接入后端）`)
}
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.tools-panel {
  padding: 24px;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tab {
  height: 42px;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid rgba(226, 232, 240, 1);
  background: #fff;
  color: rgba(71, 85, 105, 1);
  font-size: 15px;
  cursor: pointer;
}

.tab.active {
  border-color: rgba(249, 115, 22, 1);
  background: rgba(249, 115, 22, 1);
  color: #fff;
  font-weight: 700;
}

.tool-grid {
  margin-top: 32px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}

.tool-card {
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.tool-card-inner {
  padding: 24px;
}

.tool-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.tool-icon,
.recent-icon {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.tool-icon.orange,
.recent-icon.orange {
  background: rgba(255, 237, 213, 1);
}

.tool-icon.green,
.recent-icon.green {
  background: rgba(220, 252, 231, 1);
}

.tool-icon.blue,
.recent-icon.blue {
  background: rgba(219, 234, 254, 1);
}

.tool-icon.purple,
.recent-icon.purple {
  background: rgba(243, 232, 255, 1);
}

.tool-icon.pink,
.recent-icon.pink {
  background: rgba(252, 231, 243, 1);
}

.tool-icon.cyan,
.recent-icon.cyan {
  background: rgba(236, 254, 255, 1);
}

.tool-icon.emerald,
.recent-icon.emerald {
  background: rgba(209, 250, 229, 1);
}

.tool-icon.indigo,
.recent-icon.indigo {
  background: rgba(224, 231, 255, 1);
}

.use-btn {
  border: none;
  background: rgba(255, 237, 213, 1);
  color: rgba(249, 115, 22, 1);
  height: 24px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
}

.tool-title {
  margin-top: 16px;
  font-size: 18px;
  font-weight: 700;
  color: rgba(30, 41, 59, 1);
}

.tool-desc {
  margin-top: 12px;
  min-height: 66px;
  font-size: 14px;
  line-height: 22px;
  color: rgba(100, 116, 139, 1);
}

.tool-footer {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.tool-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: rgba(148, 163, 184, 1);
}

.rating {
  color: rgba(249, 115, 22, 1);
}

.recent-section {
  margin-top: 32px;
}

.section-title {
  font-size: 22px;
  font-weight: 800;
  color: rgba(30, 41, 59, 1);
}

.recent-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}

.recent-card {
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.recent-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
}

.recent-title {
  font-size: 16px;
  font-weight: 700;
  color: rgba(30, 41, 59, 1);
}

.recent-time {
  margin-top: 2px;
  font-size: 12px;
  color: rgba(148, 163, 184, 1);
}

.recent-block-title {
  padding: 0 20px;
  font-size: 14px;
  font-weight: 700;
  color: rgba(30, 41, 59, 1);
}

.recent-list {
  padding: 12px 20px 20px;
}

.recent-item + .recent-item {
  margin-top: 8px;
}

.recent-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}

.recent-item-label {
  color: rgba(100, 116, 139, 1);
}

.recent-item-value {
  color: rgba(148, 163, 184, 1);
  white-space: nowrap;
}

.recent-item-label.highlight,
.recent-item-value.highlight {
  color: rgba(220, 38, 38, 1);
}

.recent-item-value.success {
  color: rgba(22, 163, 74, 1);
}

@media (max-width: 1400px) {
  .tool-grid,
  .recent-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .tools-panel {
    padding: 16px;
  }

  .tool-grid,
  .recent-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .tool-card-inner,
  .recent-header,
  .recent-list {
    padding-left: 16px;
    padding-right: 16px;
  }

  .recent-block-title {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
