<template>
  <div class="admin-page">
    <div class="admin-hero card">
      <div>
        <div class="hero-title">后台管理中心</div>
        <div class="hero-subtitle">用于处理认证材料审核、贴文审核、课程审核与板块管理。</div>
      </div>
      <div class="hero-badges">
        <span class="hero-badge">仅管理员可见</span>
        <span class="hero-badge muted">当前角色：{{ appStore.role }}</span>
      </div>
    </div>

    <div class="admin-layout">
      <aside class="sidebar card">
        <div class="sidebar-title">管理模块</div>
        <div class="sidebar-subtitle">通过侧边栏切换不同后台功能。</div>

        <button
          v-for="item in navItems"
          :key="item.key"
          type="button"
          class="sidebar-item"
          :class="{ active: activeModule === item.key }"
          @click="activeModule = item.key"
        >
          <span class="sidebar-item-left">
            <span class="sidebar-icon">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </span>
          <span class="sidebar-count">{{ item.count }}</span>
        </button>

        <div class="summary-grid">
          <div v-for="item in summaryCards" :key="item.label" class="summary-card">
            <div class="summary-label">{{ item.label }}</div>
            <div class="summary-value">{{ item.value }}</div>
            <div class="summary-desc">{{ item.desc }}</div>
          </div>
        </div>
      </aside>

      <section class="content-area">
        <CertificationReviewPanel
          v-if="activeModule === 'certification'"
          :items="certifications"
          :status-label-map="statusLabelMap"
          :status-type-map="statusTypeMap"
          v-loading="certificationLoading"
          @preview="handlePreview"
          @approve="handleApprove"
          @reject="handleReject"
        />

        <PostReviewPanel
          v-else-if="activeModule === 'post'"
          :items="postReviews"
          :loading="postReviewLoading"
          :status-label-map="statusLabelMap"
          :status-type-map="statusTypeMap"
          @preview="handlePreview"
          @approve="handleApprove"
          @offline="handleOffline"
        />

        <CourseReviewPanel
          v-else-if="activeModule === 'course'"
          v-loading="courseReviewLoading"
          :items="courseReviews"
          :status-label-map="statusLabelMap"
          :status-type-map="statusTypeMap"
          @preview="handlePreview"
          @view-detail="openCourseDetail"
          @approve="handleApprove"
          @reject="handleReject"
        />

        <BoardManagePanel
          v-else
          :items="boards"
          @create="handleCreateBoard"
          @edit="handleEditBoard"
          @toggle="handleToggleBoard"
        />
      </section>
      <el-dialog
        v-model="courseDetailDialogVisible"
        title="课程详情"
        width="960px"
        :destroy-on-close="true"
        append-to-body
        @close="handleCourseDetailClose"
      >
        <CourseDetailView :course-id="courseDetailId" :visible="courseDetailDialogVisible" />
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { auditForum, getAllForumList } from '@/api/forum'
import { changeUserRole, getExpertCertificationMaterial, getExpertCertificationMaterialList } from '@/api/admin'
import { auditCourse, getAllCourseList } from '@/api/course'
import { useAppStore } from '@/store/app'
import CertificationReviewPanel from './components/CertificationReviewPanel.vue'
import PostReviewPanel from './components/PostReviewPanel.vue'
import CourseReviewPanel from './components/CourseReviewPanel.vue'
import BoardManagePanel from './components/BoardManagePanel.vue'
import CourseDetailView from '@/views/courses/components/CourseDetailView.vue'

const appStore = useAppStore()
const router = useRouter()
const activeModule = ref('certification')
const postReviewLoading = ref(false)
const certificationLoading = ref(false)

const statusLabelMap = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
}

function mapCourseReviewItem(item) {
  const status = normalizeAuditStatus(item?.auditStatus ?? item?.status)
  const priceNumber = Number(item?.price ?? item?.coursePrice ?? 0)

  return {
    type: COURSE_TYPE,
    id: item?.id,
    title: item?.title || '未命名课程',
    instructor: item?.expertNickname || item?.instructor || '未知讲师',
    category: item?.category || item?.courseCategory || '综合专题',
    price: priceNumber > 0 ? `¥${priceNumber.toFixed?.(2) || priceNumber}` : '免费',
    status,
    raw: item,
  }
}

const statusTypeMap = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

const CERTIFICATION_TYPE = 'certification'
const COURSE_TYPE = 'course'

const certifications = ref([])

const postReviews = ref([])

const courseReviews = ref([])
const courseReviewLoading = ref(false)
const courseDetailDialogVisible = ref(false)
const courseDetailId = ref(null)

function normalizeCourseListResponse(res) {
  const source = res?.data ?? res
  if (Array.isArray(source?.records)) return source.records
  if (Array.isArray(source?.list)) return source.list
  if (Array.isArray(source)) return source
  return []
}

async function fetchCourseReviews() {
  courseReviewLoading.value = true
  try {
    const res = await getAllCourseList({ page: 1, size: 50 })
    const list = normalizeCourseListResponse(res)
    courseReviews.value = list.map(mapCourseReviewItem)
  } catch (error) {
    courseReviews.value = []
    ElMessage.error(error?.message || '获取课程审核列表失败')
  } finally {
    courseReviewLoading.value = false
  }
}

const boards = ref([
  { id: 1, name: '睡眠训练', owner: '张版主', postCount: 126, sort: 1, enabled: true },
  { id: 2, name: '营养喂养', owner: '刘版主', postCount: 214, sort: 2, enabled: true },
  { id: 3, name: '亲子沟通', owner: '李版主', postCount: 98, sort: 3, enabled: false },
])

const navItems = computed(() => [
  {
    key: 'certification',
    label: '认证材料审核',
    icon: '🪪',
    count: certifications.value.filter((item) => item.status === 'pending').length,
  },
  {
    key: 'post',
    label: '贴文审核',
    icon: '📝',
    count: postReviews.value.filter((item) => item.status === 'pending').length,
  },
  {
    key: 'course',
    label: '课程审核',
    icon: '🎓',
    count: courseReviews.value.filter((item) => item.status === 'pending').length,
  },
  {
    key: 'board',
    label: '板块管理',
    icon: '🧩',
    count: boards.value.filter((item) => item.enabled).length,
  },
])

const summaryCards = computed(() => [
  {
    label: '待审认证',
    value: certifications.value.filter((item) => item.status === 'pending').length,
    desc: '待管理员处理的专家认证申请',
  },
  {
    label: '待审贴文',
    value: postReviews.value.filter((item) => item.status === 'pending').length,
    desc: '需要复核的社区内容',
  },
  {
    label: '待审课程',
    value: courseReviews.value.filter((item) => item.status === 'pending').length,
    desc: '等待发布的课程内容',
  },
  {
    label: '启用板块',
    value: boards.value.filter((item) => item.enabled).length,
    desc: '当前开放给用户的社区板块',
  },
])

function normalizeAuditStatus(status) {
  if (status === 1 || status === '1' || status === 'approved' || status === '已发布') return 'approved'
  if (status === 2 || status === '2' || status === 'rejected' || status === '已驳回') return 'rejected'
  return 'pending'
}

function normalizeForumListResponse(res) {
  return Array.isArray(res) ? res : Array.isArray(res?.records) ? res.records : Array.isArray(res?.data) ? res.data : []
}

function normalizeCertificationListResponse(res) {
  const source = res?.data ?? res
  if (Array.isArray(source?.records)) return source.records
  if (Array.isArray(source?.list)) return source.list
  if (Array.isArray(source)) return source
  return []
}

function formatDateTime(value) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

function isCertificationItem(payload) {
  return payload && typeof payload === 'object' && payload.type === CERTIFICATION_TYPE
}

function isCourseItem(payload) {
  return payload && typeof payload === 'object' && payload.type === COURSE_TYPE
}

function mapCertificationItem(item) {
  const status = normalizeAuditStatus(item?.status ?? item?.auditStatus ?? item?.reviewStatus ?? item?.state)

  return {
    type: CERTIFICATION_TYPE,
    id: item?.id ?? item?.certificationId ?? `${item?.userId ?? 'user'}-${item?.createTime ?? Date.now()}`,
    userId: item?.userId ?? item?.applicantId ?? item?.id,
    name: item?.userNickname || item?.nickname || item?.username || item?.name || `用户${item?.userId ?? ''}`,
    field: item?.field || item?.specialty || item?.domain || item?.profession || '综合领域',
    submitTime: formatDateTime(item?.submitTime || item?.createTime || item?.updateTime || item?.applyTime),
    fileName: item?.fileName || item?.certificationName || item?.materialName || '认证材料',
    status,
    raw: item,
  }
}

async function fetchCertifications() {
  certificationLoading.value = true
  try {
    const res = await getExpertCertificationMaterialList()
    const list = normalizeCertificationListResponse(res)
    certifications.value = list.map(mapCertificationItem)
  } catch (error) {
    certifications.value = []
    ElMessage.error(error?.message || '获取认证材料列表失败')
  } finally {
    certificationLoading.value = false
  }
}

async function fetchPostReviews() {
  postReviewLoading.value = true
  try {
    const res = await getAllForumList({ page: 1, size: 50 })
    const list = normalizeForumListResponse(res)
    postReviews.value = list.map((item) => ({
      ...item,
      title: item.title || '未命名贴文',
      author: item.isAnonymous ? '匿名用户' : item.authorNickname || item.nickname || `用户${item.userId ?? ''}`,
      board: item.sectionName || item.sectionCode || '未分类',
      reportCount: Number(item.reportCount || 0),
      status: normalizeAuditStatus(item.auditStatus ?? item.status),
    }))
  } catch (error) {
    postReviews.value = []
    ElMessage.error(error?.message || '获取贴文审核列表失败')
  } finally {
    postReviewLoading.value = false
  }
}

function revokeObjectUrl(url) {
  if (!url) return
  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 60000)
}

async function previewCertificationMaterial(item) {
  if (!item?.userId) {
    ElMessage.error('缺少用户信息，无法预览认证材料')
    return
  }

  try {
    const blob = await getExpertCertificationMaterial(item.userId)
    if (!blob || typeof blob !== 'object' || typeof blob.size !== 'number' || blob.size <= 0) {
      ElMessage.warning('未获取到认证材料文件')
      return
    }
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener,noreferrer')
    revokeObjectUrl(url)
  } catch (error) {
    ElMessage.error(error?.message || '获取认证材料失败')
  }
}

async function assignUserRole(userId, role, successMessage) {
  if (!userId) {
    ElMessage.error('缺少用户ID，无法更新角色')
    return false
  }

  try {
    await changeUserRole(userId, role)
    if (successMessage) {
      ElMessage.success(successMessage)
    }
    return true
  } catch (error) {
    ElMessage.error(error?.message || '更新用户角色失败')
    return false
  }
}

function updateCertificationStatus(id, status) {
  certifications.value = certifications.value.map((item) =>
    item.id === id
      ? {
          ...item,
          status,
        }
      : item
  )
}

function handlePreview(type, name) {
  if (isCertificationItem(type)) {
    previewCertificationMaterial(type)
    return
  }

  if (isCourseItem(type)) {
    openCourseDetail(type)
    return
  }

  if (typeof type === 'object' && type?.id) {
    router.push({ name: 'forum-detail', params: { id: type.id } })
    return
  }

  ElMessage.info(`预览${type}：${name}`)
}

function openCourseDetail(target) {
  const id = typeof target === 'object' ? target?.id || target?.raw?.id : target
  if (!id) return
  courseDetailId.value = id
  courseDetailDialogVisible.value = true
}

function handleCourseDetailClose() {
  courseDetailDialogVisible.value = false
  courseDetailId.value = null
}

async function handleApprove(type, name) {
  if (isCertificationItem(type)) {
    const success = await assignUserRole(type.userId, 2, `${type.name} 已授予专家角色`)
    if (success) {
      updateCertificationStatus(type.id, 'approved')
    }
    return
  }

  if (isCourseItem(type)) {
    try {
      await auditCourse(type.id, 1, '课程审核通过')
      ElMessage.success(`课程审核通过：${type.title}`)
      await fetchCourseReviews()
    } catch (error) {
      ElMessage.error(error?.message || '课程审核通过失败')
    }
    return
  }

  if (typeof type === 'object' && type?.id) {
    try {
      await auditForum({ postId: type.id, status: 1 })
      ElMessage.success(`贴文审核通过：${type.title}`)
      await fetchPostReviews()
    } catch (error) {
      ElMessage.error(error?.message || '贴文审核通过失败')
    }
    return
  }

  ElMessage.success(`${type}审核通过：${name}（待接入后端）`)
}

async function handleReject(type, name) {
  if (isCertificationItem(type)) {
    const success = await assignUserRole(type.userId, 1, `${type.name} 认证已驳回，恢复普通用户角色`)
    if (success) {
      updateCertificationStatus(type.id, 'rejected')
    }
    return
  }

  if (isCourseItem(type)) {
    try {
      await auditCourse(type.id, 2, '课程已驳回')
      ElMessage.warning(`课程已驳回：${type.title}`)
      await fetchCourseReviews()
    } catch (error) {
      ElMessage.error(error?.message || '课程驳回失败')
    }
    return
  }

  ElMessage.warning(`${type}已驳回：${name}（待接入后端）`)
}

async function handleOffline(item) {
  if (item?.id) {
    try {
      await auditForum({ postId: item.id, status: 2 })
      ElMessage.success(`贴文已驳回：${item.title}`)
      await fetchPostReviews()
    } catch (error) {
      ElMessage.error(error?.message || '贴文驳回失败')
    }
    return
  }
  ElMessage.warning(`贴文已下架：${item}（待接入后端）`)
}

function handleCreateBoard() {
  ElMessage.info('新增板块：待接入后端')
}

function handleEditBoard(name) {
  ElMessage.info(`编辑板块：${name}（待接入后端）`)
}

function handleToggleBoard(item) {
  item.enabled = !item.enabled
  ElMessage.success(`${item.name}${item.enabled ? '已启用' : '已停用'}（前端演示）`)
}

onMounted(() => {
  fetchCertifications()
  fetchPostReviews()
  fetchCourseReviews()
})
</script>

<style scoped>
.admin-page {
  width: 1200px;
  margin: 0 auto;
  padding: 32px 0 48px;
}

.card {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.admin-hero {
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.hero-title {
  font-size: 28px;
  font-weight: 800;
  color: rgba(15, 23, 42, 1);
}

.hero-subtitle {
  margin-top: 8px;
  color: rgba(100, 116, 139, 1);
  font-size: 14px;
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-badge {
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(147, 51, 234, 0.12);
  color: rgba(126, 34, 206, 1);
  font-size: 13px;
  font-weight: 700;
}

.hero-badge.muted {
  background: rgba(241, 245, 249, 1);
  color: rgba(71, 85, 105, 1);
}

.admin-layout {
  margin-top: 24px;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 20px;
}

.sidebar {
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 24px;
}

.sidebar-title {
  font-size: 20px;
  font-weight: 800;
  color: rgba(15, 23, 42, 1);
}

.sidebar-subtitle {
  margin-top: 6px;
  font-size: 13px;
  line-height: 20px;
  color: rgba(100, 116, 139, 1);
}

.sidebar-item {
  margin-top: 12px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 12px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-item.active {
  border-color: rgba(168, 85, 247, 1);
  background: rgba(168, 85, 247, 0.08);
}

.sidebar-item-left {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(15, 23, 42, 1);
  font-weight: 700;
}

.sidebar-icon {
  font-size: 18px;
}

.sidebar-count {
  min-width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(241, 245, 249, 1);
  color: rgba(71, 85, 105, 1);
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
}

.summary-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.summary-card {
  padding: 16px;
  border-radius: 12px;
  background: rgba(248, 250, 252, 1);
}

.summary-label {
  color: rgba(100, 116, 139, 1);
  font-size: 13px;
}

.summary-value {
  margin-top: 8px;
  font-size: 32px;
  font-weight: 800;
  color: rgba(15, 23, 42, 1);
}

.summary-desc {
  margin-top: 8px;
  font-size: 13px;
  line-height: 20px;
  color: rgba(100, 116, 139, 1);
}

.content-area {
  min-width: 0;
}

@media (max-width: 1280px) {
  .admin-page {
    width: 100%;
    padding-left: 16px;
    padding-right: 16px;
  }
}

@media (max-width: 860px) {
  .admin-hero,
  .admin-layout {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .sidebar {
    position: static;
  }
}
</style>
