<template>
  <div class="courses-page">
    <EnrollDialog v-model="enrollDialogVisible" :course="currentCourse" @submit="handleEnrollSubmit" />
    <PublishCourseDialog
      v-model="createDialogVisible"
      :submitting="createSubmitting"
      @submit="handleCreateCourseSubmit"
    />
    <el-dialog v-model="detailDialogVisible" title="课程详情" width="960px" :before-close="handleDetailClose">
      <CourseDetailView :course-id="detailCourseId" />
    </el-dialog>
    <section class="courses-hero">
      <div class="hero-container">
        <div class="hero-left">
          <div class="hero-title">在线课程</div>
          <div class="hero-sub">精选育儿课程与专题训练，循序渐进提升育儿能力</div>

          <div class="hero-stats">
            <div class="stat">
              <div class="stat-value">200+</div>
              <div class="stat-label">精品课程</div>
            </div>
            <div class="stat">
              <div class="stat-value">5万+</div>
              <div class="stat-label">累计学习</div>
            </div>
            <div class="stat">
              <div class="stat-value">4.9</div>
              <div class="stat-label">平均评分</div>
            </div>
          </div>
        </div>

        <div class="hero-actions">
          <el-button class="btn-primary" type="primary" @click="scrollToCourses">开始学习</el-button>
          <el-button class="btn-secondary" @click="scrollToTopics">专题推荐</el-button>
          <el-button
            v-if="isExpert"
            class="btn-create"
            type="success"
            plain
            @click="openCreateDialog"
          >创建课程</el-button>
        </div>
      </div>
    </section>

    <section class="courses-main">
      <div ref="coursesAnchor" class="main-container">
        <div class="category-tabs">
          <button
            v-for="t in tabs"
            :key="t.key"
            class="tab"
            :class="{ active: t.key === activeTab }"
            type="button"
            @click="activeTab = t.key"
          >
            {{ t.name }}
          </button>
        </div>

        <div class="spacer" />

        <section class="section">
          <div class="section-header">
            <div class="section-left">
              <div class="section-title">推荐课程</div>
              <div class="section-sub">从基础到进阶，覆盖常见育儿难题</div>
            </div>
            <el-button class="view-all" @click="handleViewAll">查看全部</el-button>
          </div>

          <div class="course-grid" v-loading="courseLoading">
            <div v-if="!courseLoading && filteredCourses.length === 0" class="empty-state">暂无课程</div>
            <article
              v-for="c in filteredCourses"
              :key="c.id"
              class="course-card"
              :class="{ highlight: highlightCourseId === String(c.id) }"
              :data-course-id="`course-${c.id}`"
              @click="openCourse(c)"
            >
              <div class="course-cover">
                <div v-if="c.badge" class="course-badge">{{ c.badge }}</div>
                <img :src="c.cover" alt="cover" />
              </div>

              <div class="course-body">
                <div class="course-title">{{ c.title }}</div>

                <div class="course-instructor">
                  <div class="avatar"><img :src="c.instructorAvatar" alt="avatar" /></div>
                  <div class="instructor">{{ c.instructor }}</div>
                </div>

                <div class="course-meta">
                  <div class="meta-item">{{ c.level }}</div>
                  <div class="meta-item">{{ c.duration }}</div>
                </div>

                <div class="course-footer">
                  <div class="price">{{ c.priceText }}</div>
                  <el-button size="small" type="primary" @click.stop="enrollCourse(c)">立即报名</el-button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <div ref="topicsAnchor" class="spacer" />

        <section class="section">
          <div class="section-header">
            <div class="section-left">
              <div class="section-title">专题推荐</div>
              <div class="section-sub">按主题快速提升，适合碎片化学习</div>
            </div>
          </div>

          <div class="topic-grid">
            <article v-for="t in topics" :key="t.id" class="topic-card" @click="openTopic(t)">
              <div class="topic-cover">
                <img :src="t.cover" alt="cover" />
              </div>
              <div class="topic-body">
                <div class="topic-title">{{ t.title }}</div>
                <div class="topic-sub">{{ t.sub }}</div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import { getCourseList, createCourse, lectureViewImages } from '@/api/course'
import { useAppStore } from '@/store/app'
import EnrollDialog from './components/EnrollDialog.vue'
import PublishCourseDialog from './components/PublishCourseDialog.vue'
import CourseDetailView from './components/CourseDetailView.vue'

const tabs = [
  { key: 'all', name: '全部课程' },
  { key: 'newborn', name: '新生儿护理' },
  { key: 'nutrition', name: '营养喂养' },
  { key: 'psychology', name: '心理成长' },
  { key: 'education', name: '学习方法' },
]

const activeTab = ref('all')

const appStore = useAppStore()
const route = useRoute()

const courses = ref([])
const coverPreviewMap = ref(new Map())
const courseLoading = ref(false)
const highlightCourseId = ref(route.query.highlight ? String(route.query.highlight) : '')

const topics = ref([
  {
    id: 1,
    title: '睡眠训练专题',
    sub: '建立规律作息，让全家睡个好觉',
    cover: 'https://picsum.photos/seed/tp1/900/600',
  },
  {
    id: 2,
    title: '挑食改善专题',
    sub: '科学喂养，从此不再为吃饭焦虑',
    cover: 'https://picsum.photos/seed/tp2/900/600',
  },
  {
    id: 3,
    title: '情绪管理专题',
    sub: '理解孩子情绪，提升亲子沟通质量',
    cover: 'https://picsum.photos/seed/tp3/900/600',
  },
])

const filteredCourses = computed(() => {
  if (activeTab.value === 'all') return courses.value
  return courses.value.filter((c) => c.type === activeTab.value)
})

const isExpert = computed(() => appStore.role === '专家')

const coursesAnchor = ref(null)
const topicsAnchor = ref(null)

const enrollDialogVisible = ref(false)
const currentCourse = ref(null)
const createDialogVisible = ref(false)
const createSubmitting = ref(false)
const detailDialogVisible = ref(false)
const detailCourseId = ref(null)

function scrollToCourses() {
  const el = coursesAnchor.value
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollToTopics() {
  const el = topicsAnchor.value
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleViewAll() {
  activeTab.value = 'all'
  fetchCourses()
}

function openCourse(course) {
  detailCourseId.value = course?.id || course?.raw?.id
  if (!detailCourseId.value) {
    ElMessage.warning('无法展示课程详情')
    return
  }
  detailDialogVisible.value = true
}

function enrollCourse(course) {
  currentCourse.value = course ?? null
  enrollDialogVisible.value = true
}

function handleEnrollSubmit(payload) {
  const title = payload?.course?.title
  ElMessage.success(title ? `已提交报名：${title}` : '已提交报名成功')
}

function openTopic(topic) {
  ElMessage.info(`打开专题：${topic.title}`)
}

function normalizeListResponse(res) {
  const source = res?.data ?? res
  if (Array.isArray(source?.records)) return source.records
  if (Array.isArray(source?.list)) return source.list
  if (Array.isArray(source)) return source
  return []
}

function normalizeImage(value) {
  if (Array.isArray(value)) return normalizeImage(value[0])
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http')) return trimmed
  if (trimmed.startsWith('data:')) return trimmed
  return `data:image/jpeg;base64,${trimmed}`
}

function formatDuration(seconds) {
  const totalSeconds = Number(seconds || 0)
  if (!totalSeconds || Number.isNaN(totalSeconds)) return '时长未知'
  const minutes = Math.max(1, Math.round(totalSeconds / 60))
  return minutes >= 60 ? `${(minutes / 60).toFixed(1)} 小时` : `${minutes} 分钟`
}

function mapCourseItem(item) {
  const duration = formatDuration(item?.durationSeconds)
  const type = item?.category || item?.courseCategory || 'all'
  const badge = item?.auditStatus === 1 ? '已上线' : item?.auditStatus === 0 ? '待审核' : ''
  const coverKey = item?.coverUrl
  const previewCover = coverKey ? coverPreviewMap.value.get(coverKey) : ''

  return {
    id: item?.id,
    type,
    badge,
    title: item?.title || '未命名课程',
    instructor: item?.expertNickname || '专家课程',
    instructorAvatar: normalizeImage(item?.expertAvatar) || 'https://picsum.photos/seed/course-avatar/100/100',
    level: item?.level || '综合',
    duration,
    priceText: Number(item?.price ?? item?.coursePrice ?? 0) > 0 ? `¥${item.price}` : '免费',
    cover: previewCover || 'https://picsum.photos/seed/course-cover/900/600',
    coverUrl: coverKey,
    raw: item,
  }
}

function cleanupCourseCoverPreviews() {
  coverPreviewMap.value.forEach((url) => {
    if (typeof url === 'string' && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })
  coverPreviewMap.value.clear()
}

async function populateCourseCoverPreviews(courseList) {
  const tasks = (courseList || []).map(async (course) => {
    const key = course?.coverUrl
    if (!key || coverPreviewMap.value.has(key)) return
    try {
      const buffer = await lectureViewImages(key)
      if (!buffer) return
      const blob = new Blob([buffer], { type: 'image/jpeg' })
      const url = URL.createObjectURL(blob)
      coverPreviewMap.value.set(key, url)
      course.cover = url
    } catch (error) {
      console.error('课程封面预览失败', error)
    }
  })
  await Promise.all(tasks)
}

async function fetchCourses() {
  courseLoading.value = true
  cleanupCourseCoverPreviews()
  try {
    const res = await getCourseList({ page: 1, size: 30 })
    const list = normalizeListResponse(res)
    courses.value = list.map(mapCourseItem)
    await populateCourseCoverPreviews(courses.value)
    nextTick(scrollToHighlight)
  } catch (error) {
    courses.value = []
    ElMessage.error(error?.message || '获取课程列表失败')
  } finally {
    courseLoading.value = false
  }
}


function openCreateDialog() {
  createDialogVisible.value = true
}

async function handleCreateCourseSubmit(payload) {
  const title = payload?.title?.trim()
  const videoKey = payload?.videoObjectKey?.trim()
  if (!title || !videoKey) {
    ElMessage.warning('课程信息不完整，无法提交')
    return
  }

  const submitPayload = {
    title,
    coverUrl: payload.coverUrl?.trim() || '',
    courseDesc: payload.courseDesc?.trim() || '',
    videoObjectKey: videoKey,
    durationSeconds: Math.max(60, Math.round(Number(payload.durationMinutes) * 60)),
    expertId: appStore.userInfo?.id,
  }

  createSubmitting.value = true
  try {
    await createCourse(submitPayload)
    ElMessage.success('课程已提交审核')
    createDialogVisible.value = false
    await fetchCourses()
  } catch (error) {
    ElMessage.error(error?.message || '创建课程失败')
  } finally {
    createSubmitting.value = false
  }
}

function handleDetailClose() {
  detailDialogVisible.value = false
  detailCourseId.value = null
}

function scrollToHighlight() {
  if (!highlightCourseId.value) return
  nextTick(() => {
    const el = document.querySelector(`[data-course-id="course-${highlightCourseId.value}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

watch(
  () => route.query.highlight,
  (val) => {
    highlightCourseId.value = val ? String(val) : ''
    if (val) scrollToHighlight()
  }
)

onMounted(() => {
  fetchCourses()
})

onUnmounted(() => {
  cleanupCourseCoverPreviews()
})
</script>

<style scoped>
.courses-page {
  width: 100%;
}

.courses-hero {
  background: linear-gradient(90deg, rgba(168, 85, 247, 1), rgba(129, 140, 248, 1));
  padding: 32px 0;
}

.hero-container {
  width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.hero-left {
  color: #fff;
}

.hero-title {
  font-size: 36px;
  line-height: 44px;
  font-weight: 800;
}

.hero-sub {
  margin-top: 16px;
  color: rgba(241, 245, 249, 1);
  font-size: 16px;
}

.hero-stats {
  margin-top: 24px;
  display: flex;
  gap: 32px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  line-height: 36px;
}

.stat-label {
  font-size: 14px;
  color: rgba(226, 232, 240, 1);
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-primary {
  background: #fff;
  border-color: #fff;
  color: rgba(147, 51, 234, 1);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 700;
}

.btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-weight: 700;
}

.btn-create {
  background: linear-gradient(120deg, rgba(34, 197, 94, 1), rgba(59, 130, 246, 1));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
  padding: 12px 26px;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(59, 130, 246, 0.35);
}

.courses-main {
  padding: 32px 0;
}

.main-container {
  width: 1200px;
  margin: 0 auto;
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
  border-color: rgba(168, 85, 247, 1);
  background: rgba(168, 85, 247, 1);
  color: #fff;
  font-weight: 700;
}

.spacer {
  height: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-title {
  font-size: 24px;
  font-weight: 800;
  color: rgba(30, 41, 59, 1);
}

.section-sub {
  margin-top: 4px;
  font-size: 14px;
  color: rgba(100, 116, 139, 1);
}

.view-all {
  border-radius: 8px;
  border: 1px solid rgba(226, 232, 240, 1);
  background: #fff;
  color: rgba(71, 85, 105, 1);
}

.course-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.course-card {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.course-card.highlight {
  border-color: rgba(249, 115, 22, 1);
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.15);
}

.course-cover {
  height: 180px;
  position: relative;
  background: rgba(241, 245, 249, 1);
}

.course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.course-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(168, 85, 247, 1);
  color: #fff;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 8px;
}

.course-body {
  padding: 14px;
}

.course-title {
  font-size: 18px;
  font-weight: 700;
  line-height: 26px;
  color: rgba(30, 41, 59, 1);
  height: 52px;
  overflow: hidden;
}

.course-instructor {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(241, 245, 249, 1);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.instructor {
  font-size: 14px;
  font-weight: 700;
  color: rgba(30, 41, 59, 1);
}

.course-meta {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  color: rgba(100, 116, 139, 1);
  font-size: 12px;
}

.course-footer {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.price {
  font-size: 14px;
  font-weight: 800;
  color: rgba(147, 51, 234, 1);
}

.topic-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.empty-state {
  grid-column: 1 / -1;
  padding: 48px 16px;
  text-align: center;
  color: rgba(100, 116, 139, 1);
  background: rgba(248, 250, 252, 1);
  border-radius: 12px;
}

.duration-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.duration-hint {
  color: rgba(100, 116, 139, 1);
  font-size: 13px;
}

.topic-card {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.topic-cover {
  height: 140px;
  background: rgba(241, 245, 249, 1);
}

.topic-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.topic-body {
  padding: 14px;
}

.topic-title {
  font-size: 16px;
  font-weight: 800;
  color: rgba(30, 41, 59, 1);
}

.topic-sub {
  margin-top: 6px;
  font-size: 13px;
  line-height: 20px;
  color: rgba(100, 116, 139, 1);
}

@media (max-width: 1280px) {
  .hero-container,
  .main-container {
    width: 100%;
    padding-left: 16px;
    padding-right: 16px;
  }

  .course-grid,
  .topic-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 860px) {
  .hero-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .course-grid,
  .topic-grid {
    grid-template-columns: 1fr;
  }
}
</style>
