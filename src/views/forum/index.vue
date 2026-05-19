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

        <PostEditorDialog v-model="postEditorVisible" @submit="handlePostSubmit" />

        <div v-if="loading" class="state">加载中...</div>
        <div v-else-if="filteredPosts.length === 0" class="state">暂无内容</div>

        <div v-else class="post-list">
          <article v-for="post in pagedPosts" :key="post.id" class="post">
            <div class="post-header">
              <AuthorInfo
                :user-id="post.userId"
                :avatar="post.avatar"
                :nickname="post.author"
                :anonymous="post.isAnonymous"
                :subtitle="`${post.time} · ${post.categoryName}`"
              />

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
              :total="total"
              :current-page="page"
              @current-change="handlePageChange"
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
import { useRouter } from 'vue-router'
import { getDictList } from '@/api/dict.js'
import { getForumList, uploadForum } from '@/api/forum.js'
import AppFooter from '@/components/AppFooter.vue'
import AuthorInfo from '@/components/AuthorInfo.vue'
import PostEditorDialog from '@/views/forum/components/PostEditorDialog.vue'

const loading = ref(false)

const router = useRouter()

const stats = ref({
  topics: '1.2k',
  posts: '18.4k',
  users: '6.8k',
})

const categories = ref([{ key: 'all', name: '全部' }])

const sortTabs = [
  { key: 'hot', name: '热门' },
  { key: 'latest', name: '最新' },
  { key: 'follow', name: '关注' },
]

const activeCategory = ref('all')
const activeSort = ref('hot')
const keyword = ref('')

const postEditorVisible = ref(false)
const postSubmitting = ref(false)

const page = ref(1)
const pageSize = 6
const total = ref(0)

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

async function getCategories() {
  try {
    const res = await getDictList('forum')

    categories.value = [
      { key: 'all', name: '全部' },
      ...res.map((item) => ({
        key: item.dictCode,
        name: item.dictName,
      })),
    ]
  } catch (error) {
    ElMessage.error(error?.message || '获取分类失败')
  }
}

onMounted(async () => {
  await getCategories()
  await fetchPosts()
})

function resetPage() {
  page.value = 1
}

function selectCategory(key) {
  activeCategory.value = key
  resetPage()
  fetchPosts()
}

function handlePageChange(p) {
  page.value = p
  fetchPosts()
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
  router.push({ name: 'forum-detail', params: { id: post.id } })
}

function openTopic(topic) {
  ElMessage.info(`打开话题：${topic.name}`)
}

function followUser(user) {
  ElMessage.success(`已关注：${user.name}`)
}

function createPost() {
  postEditorVisible.value = true
}

async function handlePostSubmit(payload) {
  if (postSubmitting.value) return

  postSubmitting.value = true
  try {
    await uploadForum({
      title: payload?.title,
      coverImages: payload?.coverUrl,
      tags: payload?.tags,
      content: payload?.content,
      sectionCode: payload?.board,
      isAnonymous: Number(payload?.isAnonymous),
    })

    postEditorVisible.value = false
    ElMessage.success('发布成功')
    await fetchPosts()
  } catch (error) {
    ElMessage.error(error?.message || '发布失败')
  } finally {
    postSubmitting.value = false
  }
}

async function fetchPosts() {
  loading.value = true
  try {
    const res = await getForumList({
      page: page.value,
      size: pageSize,
      sectionCode: activeCategory.value === 'all' ? '' : activeCategory.value,
      keyword: keyword.value,
    })

    const records = Array.isArray(res?.records) ? res.records : []
    total.value = typeof res?.total === 'number' ? res.total : records.length

    const normalizeAvatar = (value) => {
      if (!value) return ''
      if (typeof value !== 'string') return ''

      const trimmed = value.trim()
      if (!trimmed) return ''
      if (trimmed.startsWith('data:image/')) return trimmed
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) return trimmed
      return `data:image/png;base64,${trimmed}`
    }

    posts.value = records.map((item) => ({
      id: item.id,
      title: item.title,
      userId: item.userId,
      excerpt: String(item.content || '').replace(/<[^>]+>/g, '').slice(0, 120),
      author: item.isAnonymous ? '匿名用户' : item.authorNickname,
      avatar: normalizeAvatar(item.authorAvatar),
      isAnonymous: item.isAnonymous === 1 || item.isAnonymous === true,
      time: item.createTime ? String(item.createTime).replace('T', ' ').slice(0, 16) : '',
      category: item.sectionCode,
      categoryName: item.sectionName,
      tags: [],
      likes: item.likeCount || 0,
      comments: item.commentCount || 0,
      views: item.viewCount || 0,
      shares: 0,
      followed: false,
      collected: false,
    }))
  } finally {
    loading.value = false
  }
}

// function makeMockPosts() {
//   return [
//     {
//       id: 1,
//       title: '宝宝夜醒频繁，怎么调整作息？',
//       excerpt: '最近宝宝半夜总是醒，可能是白天小睡安排不合理，也可能是睡前仪式没建立好。大家有什么建议？',
//       author: '小月妈',
//       time: '10 分钟前',
//       category: 'newborn',
//       categoryName: '新生儿',
//       tags: ['睡眠训练', '夜醒', '作息'],
//       likes: 128,
//       comments: 34,
//       views: 2360,
//       shares: 19,
//       followed: false,
//       collected: false,
//     },
// }

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

.avatar-sm {
  width: 34px;
  height: 34px;
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
