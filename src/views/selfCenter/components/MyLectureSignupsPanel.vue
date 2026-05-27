<template>
  <section class="my-lecture-signups-panel card">
    <div class="panel-header">
      <div>
        <div class="panel-title">我的讲座预约</div>
        <div class="panel-subtitle">查看你已报名的讲座，并可在未结束前取消报名。</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">报名总数</div>
        <div class="stat-value">{{ total }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">待参加</div>
        <div class="stat-value">{{ upcomingCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已结束</div>
        <div class="stat-value">{{ endedCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已签到</div>
        <div class="stat-value">{{ attendedCount }}</div>
      </div>
    </div>

    <div v-loading="loading" class="list-wrap">
      <div v-if="!loading && signups.length === 0" class="empty-state">你还没有报名过讲座</div>

      <div v-else class="lecture-list">
        <div v-for="item in signups" :key="item.signupId || item.id" class="lecture-card">
          <div class="lecture-main">
            <div class="lecture-title-row">
              <div class="lecture-title">{{ item.title }}</div>
              <el-tag :type="item.ended ? 'info' : 'success'">{{ item.ended ? '已结束' : '待参加' }}</el-tag>
            </div>
            <div class="lecture-meta">
              <span>讲座时间 {{ formatTime(item.lectureTime) }}</span>
              <span>地点 {{ item.location || '待定' }}</span>
              <span>报名状态 {{ item.isAttend ? '已签到' : '未签到' }}</span>
            </div>
            <div class="lecture-desc">{{ item.description || '暂无讲座描述' }}</div>
          </div>

          <div class="lecture-actions">
            <el-button size="small" type="danger" plain :disabled="item.ended" @click="handleCancel(item)">取消报名</el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { cancelSignup, getMySignups, getLectureDetail } from '@/api/lecture'

const loading = ref(false)
const signups = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const upcomingCount = computed(() => signups.value.filter((item) => !item.ended).length)
const endedCount = computed(() => signups.value.filter((item) => item.ended).length)
const attendedCount = computed(() => signups.value.filter((item) => Boolean(item.isAttend)).length)

function toDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatTime(value) {
  const date = toDate(value)
  if (!date) return '未知时间'
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

function normalizeListResponse(res) {
  const source = res?.records ? res : res?.data?.records ? res.data : res?.data || res
  const list = Array.isArray(source?.records) ? source.records : Array.isArray(source) ? source : []
  const totalValue = Number(source?.total ?? list.length ?? 0)
  return { list, total: totalValue }
}

async function loadLectureDetailMap(records) {
  const lectureIds = [...new Set(records
    .map((item) => item?.lectureId)
    .filter((id) => id !== undefined && id !== null && id !== ''))]

  if (!lectureIds.length) {
    return new Map()
  }

  const entries = await Promise.all(lectureIds.map(async (lectureId) => {
    try {
      const result = await getLectureDetail(lectureId)
      const lecture = result?.data || result || {}
      return [String(lectureId), lecture]
    } catch (error) {
      return [String(lectureId), null]
    }
  }))

  return new Map(entries)
}

function normalizeSignup(item, lectureMap) {
  const lecture = lectureMap.get(String(item?.lectureId)) || {}
  const lectureTime = lecture?.lectureTime || item?.createTime || ''
  const ended = (() => {
    const date = toDate(lectureTime)
    return date ? date.getTime() < Date.now() : false
  })()

  return {
    ...item,
    signupId: item?.id,
    lectureId: item?.lectureId,
    title: lecture?.title || '未命名讲座',
    description: lecture?.description || '',
    lectureTime,
    location: lecture?.liveUrl || lecture?.location || '',
    isAttend: item?.isAttend ?? item?.attended ?? false,
    ended,
  }
}

async function fetchSignups() {
  loading.value = true
  try {
    const res = await getMySignups(page.value, pageSize.value)
    const { list, total: totalValue } = normalizeListResponse(res)
    const lectureMap = await loadLectureDetailMap(list)
    signups.value = list.map((item) => normalizeSignup(item, lectureMap))
    total.value = totalValue
  } catch (error) {
    signups.value = []
    total.value = 0
    ElMessage.error(error?.message || '获取我的讲座预约失败')
  } finally {
    loading.value = false
  }
}

async function handleCancel(item) {
  if (!item?.lectureId) {
    ElMessage.error('讲座信息不存在')
    return
  }

  try {
    await ElMessageBox.confirm('确定取消该讲座报名吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
    await cancelSignup(item.lectureId)
    ElMessage.success('已取消报名')
    if (signups.value.length === 1 && page.value > 1) {
      page.value -= 1
    }
    await fetchSignups()
  } catch (error) {
    if (error === 'cancel') return
    ElMessage.error(error?.message || '取消报名失败')
  }
}

function handlePageChange(nextPage) {
  page.value = nextPage
  fetchSignups()
}

onMounted(fetchSignups)
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.my-lecture-signups-panel {
  padding: 24px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
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

.lecture-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lecture-card {
  padding: 18px;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.lecture-main {
  min-width: 0;
  flex: 1;
}

.lecture-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.lecture-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.lecture-meta {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #64748b;
}

.lecture-desc {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.7;
  color: #475569;
}

.lecture-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.pagination-wrap {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 960px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .lecture-card,
  .lecture-title-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .lecture-actions {
    align-items: stretch;
  }
}
</style>
