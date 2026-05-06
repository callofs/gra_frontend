<template>
  <div class="forum-page">
    <section class="forum-hero">
      <div class="hero-inner">
        <h1 class="hero-title">主题论坛</h1>
        <p class="hero-sub">分享经验、提问交流，和更多家长一起成长。</p>

        <div class="hero-stats">
          <div class="stat">
            <div class="stat-value">{{ stats.topics }}</div>
            <div class="stat-label">话题数</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ stats.posts }}</div>
            <div class="stat-label">帖子数</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ stats.users }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
        </div>
      </div>
    </section>

    <section class="forum-main">
      <aside class="left">
        <div class="panel">
          <div class="panel-title">分类</div>
          <div class="category-list">
            <button
              v-for="c in categories"
              :key="c.key"
              class="category-item"
              :class="{ active: c.key === activeCategory }"
              type="button"
              @click="selectCategory(c.key)"
            >
              <span class="category-name">{{ c.name }}</span>
              <span class="category-count">{{ c.count }}</span>
            </button>
          </div>
        </div>
      </aside>

      <main class="center">
        <div class="toolbar">
          <div class="tabs">
            <button
              v-for="t in sortTabs"
              :key="t.key"
              class="tab"
              :class="{ active: t.key === activeSort }"
              type="button"
              @click="activeSort = t.key"
            >
              {{ t.name }}
            </button>
          </div>

          <div class="toolbar-actions">
            <el-input
              v-model="keyword"
              size="large"
              placeholder="搜索帖子、话题..."
              class="search"
              clearable
              @keyup.enter="fetchPosts"
            />
            <el-button type="primary" size="large" @click="createPost">发布帖子</el-button>
          </div>
        </div>

        <div v-if="loading" class="state">加载中...</div>
        <div v-else-if="filteredPosts.length === 0" class="state">暂无内容</div>

        <div v-else class="post-list">
          <article v-for="post in pagedPosts" :key="post.id" class="post">
            <div class="post-header">
              <div class="author">
                <div class="avatar">{{ post.author.slice(0, 1) }}</div>
                <div class="author-meta">
                  <div class="author-name">{{ post.author }}</div>
                  <div class="author-sub">{{ post.time }} · {{ post.categoryName }}</div>
                </div>
              </div>

              <el-button
                :type="post.followed ? 'info' : 'primary'"
                plain
                size="small"
                @click="toggleFollow(post)"
              >
                {{ post.followed ? '已关注' : '关注' }}
              </el-button>
            </div>

            <div class="post-body" @click="openPost(post)">
              <div class="post-title">{{ post.title }}</div>
              <div class="post-excerpt">{{ post.excerpt }}</div>
              <div class="tags">
                <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>

            <div class="post-footer">
              <div class="metrics">
                <span class="metric">👍 {{ post.likes }}</span>
                <span class="metric">💬 {{ post.comments }}</span>
                <span class="metric">👁️ {{ post.views }}</span>
                <span class="metric">↗ {{ post.shares }}</span>
              </div>

              <button class="collect" type="button" @click="toggleCollect(post)">
                {{ post.collected ? '已收藏' : '收藏' }}
              </button>
            </div>
          </article>

          <div class="pagination">
            <el-pagination
              background
              layout="prev, pager, next"
              :page-size="pageSize"
              :total="filteredPosts.length"
              :current-page="page"
              @current-change="(p) => (page = p)"
            />
          </div>
        </div>
      </main>

      <aside class="right">
        <div class="panel">
          <div class="panel-title">热门话题</div>
          <div class="topic-list">
            <button v-for="t in hotTopics" :key="t.id" class="topic" type="button" @click="openTopic(t)">
              <div class="topic-name">{{ t.name }}</div>
              <div class="topic-meta">{{ t.posts }} 帖子 · {{ t.views }} 浏览</div>
            </button>
          </div>
        </div>

        <div class="panel" style="margin-top: 16px;">
          <div class="panel-title">推荐关注</div>
          <div class="recommend-list">
            <div v-for="u in recommends" :key="u.id" class="recommend">
              <div class="recommend-left">
                <div class="avatar avatar-sm">{{ u.name.slice(0, 1) }}</div>
                <div class="recommend-meta">
                  <div class="recommend-name">{{ u.name }}</div>
                  <div class="recommend-sub">{{ u.desc }}</div>
                </div>
              </div>
              <el-button type="primary" plain size="small" @click="followUser(u)">关注</el-button>
            </div>
          </div>
        </div>
      </aside>
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import AppFooter from '@/components/AppFooter.vue'

const loading = ref(false)

const stats = ref({
  topics: '1.2k',
  posts: '18.4k',
  users: '6.8k',
})

const categories = ref([
  { key: 'all', name: '全部', count: 1286 },
  { key: 'newborn', name: '新生儿', count: 286 },
  { key: 'toddler', name: '幼儿成长', count: 352 },
  { key: 'education', name: '学习教育', count: 219 },
  { key: 'health', name: '健康护理', count: 188 },
  { key: 'emotion', name: '情绪与沟通', count: 241 },
])

const sortTabs = [
  { key: 'hot', name: '热门' },
  { key: 'latest', name: '最新' },
  { key: 'follow', name: '关注' },
]

const activeCategory = ref('all')
const activeSort = ref('hot')
const keyword = ref('')

const page = ref(1)
const pageSize = 6

const posts = ref([])

const filteredPosts = computed(() => {
  const normalizedKeyword = String(keyword.value || '').trim().toLowerCase()
  return posts.value
    .filter((p) => {
      if (activeCategory.value === 'all') return true
      return p.category === activeCategory.value
    })
    .filter((p) => {
      if (!normalizedKeyword) return true
      const haystack = `${p.title} ${p.excerpt} ${p.tags.join(' ')}`.toLowerCase()
      return haystack.includes(normalizedKeyword)
    })
    .filter((p) => {
      if (activeSort.value !== 'follow') return true
      return p.followed
    })
})

const pagedPosts = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredPosts.value.slice(start, start + pageSize)
})

const hotTopics = ref([
  { id: 1, name: '#断奶怎么做更顺利#', posts: '2.3k', views: '18.6k' },
  { id: 2, name: '#幼儿挑食怎么办#', posts: '1.1k', views: '9.2k' },
  { id: 3, name: '#睡眠训练经验分享#', posts: '986', views: '7.5k' },
  { id: 4, name: '#亲子沟通技巧#', posts: '1.8k', views: '11.3k' },
])

const recommends = ref([
  { id: 1, name: '张医生', desc: '儿科主任医师 · 擅长健康护理' },
  { id: 2, name: '李老师', desc: '亲子教育顾问 · 擅长学习规划' },
  { id: 3, name: '王营养师', desc: '注册营养师 · 擅长辅食搭配' },
])

function resetPage() {
  page.value = 1
}

function selectCategory(key) {
  activeCategory.value = key
  resetPage()
}

function toggleFollow(post) {
  post.followed = !post.followed
  if (post.followed) ElMessage.success('已关注该作者')
}

function toggleCollect(post) {
  post.collected = !post.collected
  if (post.collected) ElMessage.success('已收藏')
}

function openPost(post) {
  ElMessage.info(`打开帖子：${post.title}`)
}

function openTopic(topic) {
  ElMessage.info(`打开话题：${topic.name}`)
}

function followUser(user) {
  ElMessage.success(`已关注：${user.name}`)
}

function createPost() {
  ElMessage.info('发布帖子：待接入后端接口')
}

async function fetchPosts() {
  loading.value = true
  try {
    posts.value = makeMockPosts()
  } finally {
    loading.value = false
  }
}

function makeMockPosts() {
  return [
    {
      id: 1,
      title: '宝宝夜醒频繁，怎么调整作息？',
      excerpt: '最近宝宝半夜总是醒，可能是白天小睡安排不合理，也可能是睡前仪式没建立好。大家有什么建议？',
      author: '小月妈',
      time: '10 分钟前',
      category: 'newborn',
      categoryName: '新生儿',
      tags: ['睡眠训练', '夜醒', '作息'],
      likes: 128,
      comments: 34,
      views: 2360,
      shares: 19,
      followed: false,
      collected: false,
    },
    {
      id: 2,
      title: '两岁娃挑食严重，怎么引导更有效？',
      excerpt: '只吃面包和水果，青菜一口不碰。尝试过奖励和讲道理都没用。你们是怎么做的？',
      author: '橙子爸',
      time: '1 小时前',
      category: 'toddler',
      categoryName: '幼儿成长',
      tags: ['挑食', '辅食', '营养'],
      likes: 86,
      comments: 27,
      views: 1840,
      shares: 8,
      followed: true,
      collected: false,
    },
    {
      id: 3,
      title: '幼小衔接要不要报班？我们家这样安排',
      excerpt: '分享下我们的规划：每天 20 分钟亲子阅读 + 生活自理训练 + 游戏化数学，供大家参考。',
      author: '豆豆妈',
      time: '3 小时前',
      category: 'education',
      categoryName: '学习教育',
      tags: ['幼小衔接', '学习习惯', '规划'],
      likes: 214,
      comments: 63,
      views: 5120,
      shares: 41,
      followed: false,
      collected: true,
    },
    {
      id: 4,
      title: '宝宝感冒咳嗽，家庭护理要注意什么？',
      excerpt: '除了按医嘱用药，居家护理方面加湿、补水、睡姿这些细节也很重要。欢迎补充。',
      author: '张医生',
      time: '昨天',
      category: 'health',
      categoryName: '健康护理',
      tags: ['感冒', '护理', '咳嗽'],
      likes: 302,
      comments: 78,
      views: 7920,
      shares: 66,
      followed: false,
      collected: false,
    },
    {
      id: 5,
      title: '孩子发脾气时，父母怎么做不升级冲突？',
      excerpt: '先共情再设边界，情绪平复后再讨论规则。关键是稳定而一致的回应方式。',
      author: '王老师',
      time: '2 天前',
      category: 'emotion',
      categoryName: '情绪与沟通',
      tags: ['情绪', '沟通', '规则'],
      likes: 165,
      comments: 49,
      views: 4210,
      shares: 22,
      followed: true,
      collected: false,
    },
    {
      id: 6,
      title: '断奶期的心理安抚：这些方法很好用',
      excerpt: '断奶不只是停止喂奶，也需要替代性的安抚方式：拥抱、讲故事、固定的睡前仪式。',
      author: '乐乐妈',
      time: '3 天前',
      category: 'toddler',
      categoryName: '幼儿成长',
      tags: ['断奶', '安抚', '睡前仪式'],
      likes: 97,
      comments: 18,
      views: 2680,
      shares: 12,
      followed: false,
      collected: false,
    },
    {
      id: 7,
      title: '新生儿肠绞痛怎么缓解？',
      excerpt: '试过飞机抱、白噪音、热敷和排气操，效果不一。大家还有更有效的方法吗？',
      author: '小北妈',
      time: '4 天前',
      category: 'newborn',
      categoryName: '新生儿',
      tags: ['肠绞痛', '安抚', '排气操'],
      likes: 56,
      comments: 21,
      views: 1340,
      shares: 6,
      followed: false,
      collected: false,
    },
    {
      id: 8,
      title: '如何培养孩子的专注力？从日常小事做起',
      excerpt: '减少无意义的打断、建立可预期的任务流程、用游戏化方式练习等待与延迟满足。',
      author: '李老师',
      time: '5 天前',
      category: 'education',
      categoryName: '学习教育',
      tags: ['专注力', '习惯', '游戏化'],
      likes: 143,
      comments: 37,
      views: 3890,
      shares: 28,
      followed: false,
      collected: false,
    },
  ]
}

onMounted(() => {
  fetchPosts()
})
</script>

<style scoped>
.forum-page {
  min-height: 100vh;
}

.forum-hero {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 1);
  border-left: none;
  border-right: none;
  padding: 28px 0;
}

.hero-inner {
  width: min(1200px, calc(100% - 28px));
  margin: 0 auto;
}

.hero-title {
  margin: 0;
  font-size: 32px;
  line-height: 1.2;
  color: rgba(15, 23, 42, 1);
  font-weight: 900;
}

.hero-sub {
  margin: 10px 0 0;
  color: rgba(71, 85, 105, 1);
  line-height: 1.6;
}

.hero-stats {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.stat {
  background: rgba(248, 250, 252, 1);
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 12px;
  padding: 14px 16px;
}

.stat-value {
  font-size: 20px;
  font-weight: 900;
  color: rgba(30, 41, 59, 1);
}

.stat-label {
  margin-top: 6px;
  font-size: 13px;
  color: rgba(100, 116, 139, 1);
}

.forum-main {
  width: min(1200px, calc(100% - 28px));
  margin: 18px auto 0;
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr) 300px;
  gap: 18px;
  align-items: start;
}

.panel {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 14px;
  overflow: hidden;
}

.panel-title {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-weight: 900;
  color: rgba(30, 41, 59, 1);
  border-bottom: 1px solid rgba(226, 232, 240, 1);
}

.category-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-item {
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 1);
  background: rgba(248, 250, 252, 1);
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  color: rgba(30, 41, 59, 1);
}

.category-item.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 1);
}

.category-count {
  color: rgba(100, 116, 139, 1);
  font-size: 13px;
}

.toolbar {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 14px;
  padding: 14px;
}

.tabs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tab {
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(226, 232, 240, 1);
  background: rgba(248, 250, 252, 1);
  cursor: pointer;
  color: rgba(30, 41, 59, 1);
  font-weight: 800;
}

.tab.active {
  background: rgba(59, 130, 246, 1);
  border-color: rgba(59, 130, 246, 1);
  color: #fff;
}

.toolbar-actions {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search {
  flex: 1;
}

.state {
  margin-top: 18px;
  background: #fff;
  border: 1px dashed rgba(226, 232, 240, 1);
  border-radius: 14px;
  padding: 24px;
  color: rgba(100, 116, 139, 1);
}

.post-list {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.post {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 14px;
  padding: 16px;
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.12);
  color: rgba(59, 130, 246, 1);
  display: grid;
  place-items: center;
  font-weight: 900;
  flex-shrink: 0;
}

.avatar-sm {
  width: 34px;
  height: 34px;
}

.author-name {
  font-weight: 900;
  color: rgba(30, 41, 59, 1);
}

.author-sub {
  margin-top: 2px;
  font-size: 12px;
  color: rgba(100, 116, 139, 1);
}

.post-body {
  margin-top: 12px;
  cursor: pointer;
}

.post-title {
  font-weight: 900;
  color: rgba(15, 23, 42, 1);
  font-size: 16px;
  line-height: 1.4;
}

.post-excerpt {
  margin-top: 8px;
  color: rgba(71, 85, 105, 1);
  line-height: 1.7;
}

.tags {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  height: 26px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(226, 232, 240, 1);
  background: rgba(248, 250, 252, 1);
  color: rgba(100, 116, 139, 1);
  font-size: 12px;
}

.post-footer {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(226, 232, 240, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.metrics {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.metric {
  font-size: 13px;
  color: rgba(100, 116, 139, 1);
}

.collect {
  border: 1px solid rgba(226, 232, 240, 1);
  background: rgba(248, 250, 252, 1);
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  cursor: pointer;
  color: rgba(30, 41, 59, 1);
  font-weight: 800;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 8px 0 0;
}

.topic-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.topic {
  width: 100%;
  text-align: left;
  border: 1px solid rgba(226, 232, 240, 1);
  background: rgba(248, 250, 252, 1);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
}

.topic-name {
  font-weight: 900;
  color: rgba(30, 41, 59, 1);
}

.topic-meta {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(100, 116, 139, 1);
}

.recommend-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
  border: 1px solid rgba(226, 232, 240, 1);
  background: rgba(248, 250, 252, 1);
  border-radius: 12px;
}

.recommend-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.recommend-name {
  font-weight: 900;
  color: rgba(30, 41, 59, 1);
}

.recommend-sub {
  margin-top: 2px;
  font-size: 12px;
  color: rgba(100, 116, 139, 1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 170px;
}

@media (max-width: 1100px) {
  .forum-main {
    grid-template-columns: 240px minmax(0, 1fr);
  }

  .right {
    display: none;
  }
}

@media (max-width: 860px) {
  .forum-main {
    grid-template-columns: 1fr;
  }

  .left {
    order: 2;
  }

  .center {
    order: 1;
  }
}
</style>
