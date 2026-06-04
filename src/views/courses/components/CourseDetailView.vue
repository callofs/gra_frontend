<template>
  <div class="course-detail-view" v-if="visible">
    <section class="hero">
      <div class="hero-cover">
        <img :src="coverUrl" alt="cover" />
        <div class="hero-controls" v-if="videoUrl">
          <video
            class="course-video"
            controls
            :poster="coverUrl"
            :src="videoUrl"
            preload="metadata"
          >
            您的浏览器不支持视频播放，请换一个浏览器。
          </video>
        </div>
      </div>
      <div class="hero-meta">
        <h2 class="title">{{ courseTitle }}</h2>
        <p class="subtitle">{{ courseDesc }}</p>
        <div class="meta-row">
          <span>讲师：{{ instructor }}</span>
          <span>状态：{{ statusLabel }}</span>
        </div>
        <div class="meta-row">
          <span>时长：{{ durationText }}</span>
          <span>创建于：{{ formattedDate }}</span>
        </div>
      </div>
    </section>

    <section class="detail-body">
      <div class="detail-card">
        <h3>课程介绍</h3>
        <p>{{ courseDesc }}</p>
      </div>
      <div class="detail-card">
        <h3>数据统计</h3>
        <ul>
          <li>累计观看：{{ courseStats.viewCount || 0 }}</li>
          <li>审核状态：{{ statusLabel }}（{{ courseStatusText }}）</li>
        </ul>
      </div>
    </section>
  </div>
  <div v-else class="course-detail-empty">
    <el-skeleton rows="6" animated />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage, ElSkeleton } from 'element-plus'
import { getCourseDetail, courseVedioView } from '@/api/course'

const props = defineProps({
  courseId: [String, Number],
  course: Object,
  visible: { type: Boolean, default: true },
})

const emit = defineEmits(['loaded'])

const loading = ref(false)
const videoLoading = ref(false)
const courseDetail = ref(null)
const errorMessage = ref('')
const videoUrlOverride = ref('')
const videoBlobUrl = ref('')

const resolvedCourse = computed(() => courseDetail.value || props.course)
const visible = computed(() => props.visible)

const courseTitle = computed(() => resolvedCourse.value?.title || '未命名课程')
const courseDesc = computed(() => resolvedCourse.value?.courseDesc || resolvedCourse.value?.description || '暂无简介')
const instructor = computed(() => resolvedCourse.value?.expertNickname || '专家')
const durationText = computed(() => {
  const seconds = Number(resolvedCourse.value?.durationSeconds || 0)
  if (!seconds) return '时长未知'
  const minutes = Math.max(1, Math.round(seconds / 60))
  return minutes >= 60 ? `${(minutes / 60).toFixed(1)} 小时` : `${minutes} 分钟`
})
const courseStats = computed(() => ({
  viewCount: resolvedCourse.value?.viewCount,
  auditStatus: resolvedCourse.value?.auditStatus,
}))
const coverUrl = computed(() => {
  const cover = resolvedCourse.value?.coverUrl || resolvedCourse.value?.cover || ''
  return normalizeUrl(cover)
})
const statusLabel = computed(() => {
  const status = resolvedCourse.value?.auditStatus
  switch (status) {
    case 0:
      return '待审核'
    case 1:
      return '已上线'
    case 2:
      return '已驳回'
    case 3:
      return '已下架'
    default:
      return '未知'
  }
})
const courseStatusText = computed(() => resolvedCourse.value?.auditComment || '暂无备注')
const formattedDate = computed(() => {
  const dateValue = resolvedCourse.value?.createTime || resolvedCourse.value?.updateTime
  if (!dateValue) return '未知'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return '未知'
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
})

const videoUrl = computed(() => {
  if (videoUrlOverride.value) return videoUrlOverride.value
  const video = resolvedCourse.value?.videoUrl || resolvedCourse.value?.videoObjectKey
  if (!video) return ''
  if (typeof video === 'string' && video.startsWith('http')) return video
  const base = String(import.meta.env.VITE_COURSE_VIDEO_BASE_URL || '').replace(/\/$/, '')
  if (base) return `${base}/${video}`
  return video
})

function normalizeUrl(value) {
  if (!value || typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  return trimmed
}

async function loadDetail() {
  if (!props.courseId) return
  loading.value = true
  cleanupVideoUrl()
  try {
    const res = await getCourseDetail(props.courseId)
    courseDetail.value = res?.data || res
    emit('loaded', courseDetail.value)
    await loadVideoStream(courseDetail.value?.videoObjectKey)
  } catch (error) {
    errorMessage.value = error?.message || '课程数据加载失败'
    ElMessage.error(errorMessage.value)
  } finally {
    loading.value = false
  }
}

watch(() => props.courseId, () => {
  courseDetail.value = null
  cleanupVideoUrl()
  loadDetail()
})

onMounted(() => {
  if (props.courseId) {
    loadDetail()
  }
})

onBeforeUnmount(() => {
  cleanupVideoUrl()
})

async function loadVideoStream(objectKey) {
  if (!objectKey) return
  videoLoading.value = true
  try {
    const buffer = await courseVedioView(objectKey)
    if (!buffer) return
    const blob = new Blob([buffer], { type: 'video/mp4' })
    const url = URL.createObjectURL(blob)
    videoBlobUrl.value = url
    videoUrlOverride.value = url
  } catch (error) {
    console.error('课程视频加载失败', error)
    ElMessage.error('课程视频加载失败')
  } finally {
    videoLoading.value = false
  }
}

function cleanupVideoUrl() {
  if (videoBlobUrl.value) {
    URL.revokeObjectURL(videoBlobUrl.value)
    videoBlobUrl.value = ''
  }
  videoUrlOverride.value = ''
}
</script>

<style scoped>
.course-detail-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero {
  display: flex;
  gap: 24px;
}

.hero-cover {
  flex: 0 0 420px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;
}

.hero-cover img {
  width: 100%;
  display: block;
  height: 240px;
  object-fit: cover;
}

.hero-controls {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
}

.course-video {
  width: 100%;
  min-height: 240px;
  background: transparent;
}

.hero-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
}

.subtitle {
  color: rgba(30, 41, 59, 0.8);
  margin: 0;
}

.meta-row {
  display: flex;
  gap: 16px;
  color: rgba(107, 114, 128, 1);
  margin-top: 12px;
}

.detail-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.detail-card {
  padding: 16px;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 12px;
  background: #fff;
}

.detail-card h3 {
  margin: 0 0 8px;
  font-size: 16px;
}

.detail-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  color: rgba(55, 65, 81, 0.85);
}

.detail-card li + li {
  margin-top: 6px;
}

.course-detail-empty {
  padding: 32px;
}
</style>
