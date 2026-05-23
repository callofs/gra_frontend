<template>
  <section class="favorite-panel card">
    <div class="panel-header">
      <div>
        <div class="panel-title">我的收藏</div>
        <div class="panel-subtitle">集中查看你收藏的贴文内容。</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">收藏帖子</div>
        <div class="stat-value">{{ total }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">当前页数量</div>
        <div class="stat-value">{{ posts.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">最近收藏</div>
        <div class="stat-value">{{ latestCollectTime }}</div>
      </div>
    </div>

    <div v-loading="loading" class="list-wrap">
      <div v-if="!loading && posts.length === 0" class="empty-state">你还没有收藏任何贴文</div>

      <div v-else class="post-list">
        <div v-for="item in posts" :key="item.id" class="post-card">
          <div class="post-main" @click="openDetail(item)">
            <div class="post-title">{{ item.title }}</div>
            <div class="post-meta">
              <span>{{ item.sectionName || '未分类' }}</span>
              <span>{{ formatTime(item.collectTime || item.updateTime || item.createTime) }}</span>
            </div>
            <div class="post-desc">{{ item.summary }}</div>
          </div>

          <div class="post-side">
            <el-button size="small" @click="openDetail(item)">查看详情</el-button>
            <el-button size="small" type="danger" :loading="item.uncollectLoading" @click="handleUncollect(item)">取消收藏</el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-wrap">
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page="page"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCollections, uncollectForum } from '@/api/forum'

const router = useRouter()

const loading = ref(false)
const posts = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const latestCollectTime = computed(() => {
  const first = posts.value[0]
  return first ? formatTime(first.collectTime || first.updateTime || first.createTime) : '暂无'
})

function normalizeListResponse(res) {
  const list = Array.isArray(res) ? res : Array.isArray(res?.records) ? res.records : Array.isArray(res?.data) ? res.data : []
  const totalValue = Number(res?.total ?? res?.data?.total ?? list.length ?? 0)
  return { list, total: totalValue }
}

function formatTime(value) {
  if (!value) return '暂无'
  return String(value).replace('T', ' ').slice(0, 16)
}

function normalizePost(item) {
  return {
    ...item,
    uncollectLoading: false,
    summary: String(item.content || item.summary || '').replace(/<[^>]+>/g, '').slice(0, 80) || '暂无内容摘要',
  }
}

async function fetchCollections() {
  loading.value = true
  try {
    const res = await getCollections({ page: page.value, size: pageSize.value })
    const { list, total: totalValue } = normalizeListResponse(res)
    posts.value = list.map(normalizePost)
    total.value = totalValue
  } catch (error) {
    posts.value = []
    total.value = 0
    ElMessage.error(error?.message || '获取收藏贴文失败')
  } finally {
    loading.value = false
  }
}

function openDetail(item) {
  if (!item?.id) return
  router.push({ name: 'forum-detail', params: { id: item.id } })
}

async function handleUncollect(item) {
  if (!item?.id || item.uncollectLoading) return

  item.uncollectLoading = true
  try {
    await uncollectForum(item.id)
    ElMessage.success('已取消收藏')

    if (posts.value.length === 1 && page.value > 1) {
      page.value -= 1
    }
    await fetchCollections()
  } catch (error) {
    ElMessage.error(error?.message || '取消收藏失败')
  } finally {
    item.uncollectLoading = false
  }
}

function handlePageChange(nextPage) {
  page.value = nextPage
  fetchCollections()
}

onMounted(fetchCollections)
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.favorite-panel {
  padding: 24px;
}

.panel-title {
  font-size: 24px;
  line-height: 1.3;
  font-weight: 700;
  color: #0f172a;
}

.panel-subtitle {
  margin-top: 6px;
  font-size: 14px;
  color: #64748b;
}

.stats-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 18px;
  border-radius: 12px;
  background: #f8fafc;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

.stat-value {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.list-wrap {
  margin-top: 24px;
  min-height: 240px;
}

.empty-state {
  padding: 48px 16px;
  border-radius: 12px;
  background: #f8fafc;
  text-align: center;
  color: #64748b;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-card {
  padding: 18px;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.post-main {
  min-width: 0;
  flex: 1;
  cursor: pointer;
}

.post-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.post-meta {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #64748b;
}

.post-desc {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.7;
  color: #475569;
}

.post-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  flex-shrink: 0;
}

.pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .post-card {
    flex-direction: column;
  }

  .post-side {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
