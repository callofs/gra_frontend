<template>
  <section class="follow-panel card">
    <div class="panel-header">
      <div>
        <div class="panel-title">我的关注</div>
        <div class="panel-subtitle">查看你当前关注的用户列表。</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">关注总数</div>
        <div class="stat-value">{{ users.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">最近关注</div>
        <div class="stat-value">{{ users[0]?.nickname || users[0]?.username || '暂无' }}</div>
      </div>
    </div>

    <div v-loading="loading" class="list-wrap">
      <div v-if="!loading && users.length === 0" class="empty-state">你还没有关注任何用户</div>

      <div v-else class="user-list">
        <div v-for="item in users" :key="item.id || item.userId" class="user-card">
          <div class="user-main" @click="openUser(item)">
            <div class="user-name">{{ item.nickname || item.username || `用户${item.id || item.userId || ''}` }}</div>
            <div class="user-meta">
              <span>用户 ID：{{ item.id || item.userId || '-' }}</span>
              <span>{{ item.email || item.phone || '暂无更多信息' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMyFollows } from '@/api/user'

const router = useRouter()
const loading = ref(false)
const users = ref([])

function normalizeList(res) {
  return Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.records) ? res.records : []
}

async function fetchFollows() {
  loading.value = true
  try {
    const res = await getMyFollows()
    users.value = normalizeList(res)
  } catch (error) {
    users.value = []
    ElMessage.error(error?.message || '获取我的关注失败')
  } finally {
    loading.value = false
  }
}

function openUser(item) {
  const userId = item?.id || item?.userId
  if (!userId) return
  router.push({ name: 'user-detail', params: { userId } })
}

onMounted(fetchFollows)
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.follow-panel {
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.stat-card,
.user-card {
  padding: 18px;
  border-radius: 12px;
  background: #f8fafc;
}

.stat-label,
.user-meta {
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

.user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-main {
  cursor: pointer;
}

.user-name {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.user-meta {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
