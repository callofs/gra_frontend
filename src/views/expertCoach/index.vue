<template>
  <div class="coach-page">
    <BookDialog
      v-model="bookDialogVisible"
      :expert="currentExpert"
      :schedules="currentSchedules"
      @submit="handleBookSubmit"
    />
    <LectureBookDialog
      v-model="lectureBookDialogVisible"
      :lecture="currentLecture"
      @submit="handleLectureBookSubmit"
    />
    <PublishLectureDialog
      v-model="publishDialogVisible"
      @submit="handlePublishSubmit"
    />
    <section class="coach-hero">
      <div class="hero-container">
        <div class="hero-left">
          <div class="hero-title">专家辅导</div>
          <div class="hero-sub">专业儿科医生、心理专家、教育名师在线指导，为孩子健康成长保驾护航</div>

          <div class="hero-stats">
            <div class="stat">
              <div class="stat-value">500+</div>
              <div class="stat-label">认证专家</div>
            </div>
            <div class="stat">
              <div class="stat-value">10万+</div>
              <div class="stat-label">已服务家庭</div>
            </div>
            <div class="stat">
              <div class="stat-value">98%</div>
              <div class="stat-label">满意度</div>
            </div>
          </div>
        </div>

        <div class="hero-actions">
          <el-button class="btn-primary" type="primary" @click="handleBook">预约专家</el-button>
          <el-button class="btn-secondary" @click="scrollToLectures">专家讲座</el-button>
        </div>
      </div>
    </section>

    <section class="coach-main">
      <div class="main-container">
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
              <div class="section-title">推荐专家</div>
              <div class="section-sub">精选优质专家，为您提供专业指导</div>
            </div>
            <el-button class="view-all" @click="handleViewAll">查看全部</el-button>
          </div>

          <div class="expert-grid">
            <article v-for="e in filteredExperts" :key="e.id" class="expert-card" @click="openExpert(e)">
              <div class="expert-cover" @click.stop="viewExpertProfile(e)">
                <div class="badge">实名认证</div>
                <img :src="e.cover" alt="cover" />
              </div>

              <div class="expert-body">
                <div class="expert-top">
                  <div class="expert-name">{{ e.name }}</div>
                  <div class="expert-tag">{{ e.tag }}</div>
                </div>
                <div class="expert-desc">{{ e.desc }}</div>

                <div class="expert-meta">
                  <div class="meta-item">{{ e.hospital }}</div>
                  <div class="meta-item">{{ e.years }} 年经验</div>
                </div>

                <div class="expert-actions">
                  <el-button size="small" class="outline" @click.stop="handleBook(e)">立即预约</el-button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <div ref="lecturesAnchor" class="spacer" />

        <section class="section">
          <div class="section-header">
            <div class="section-left">
              <div class="section-title">专家讲座</div>
              <div class="section-sub">热门直播与回放，随时学习育儿知识</div>
            </div>
            <el-button
              v-if="isExpert"
              class="publish-btn"
              type="primary"
              @click="handlePublish"
            >
              发布讲座
            </el-button>
          </div>

          <div class="lecture-grid">
            <article v-for="l in lectures" :key="l.id" class="lecture-card" @click="openLecture(l)">
              <div class="lecture-cover">
                <div class="lecture-tag">{{ l.statusText }}</div>
                <div class="play-count">已报名 {{ l.currentParticipants }}/{{ l.maxSignUp }}</div>
                <img :src="l.cover" alt="cover" />
              </div>

              <div class="lecture-body">
                <div class="lecture-title">{{ l.title }}</div>

                <div class="lecture-expert">
                  <div class="avatar"><img :src="l.expertAvatar" alt="avatar" /></div>
                  <div class="expert">{{ l.expert }}</div>
                </div>

                <div class="lecture-footer">
                  <div class="time">{{ l.time }}</div>
                  <el-button size="small" type="primary" @click.stop="handleLectureAction(l)">
                    {{ l.ended ? '观看回放' : l.signedUp ? '取消预约' : '立即预约' }}
                  </el-button>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import BookDialog from './components/BookDialog.vue'
import LectureBookDialog from './components/LectureBookDialog.vue'
import PublishLectureDialog from './components/PublishLectureDialog.vue'
import { getLectureList, signupLecture, cancelSignup, createLecture, uploadLectureImage } from '@/api/lecture'
import { getExpertsList, getUserById } from '@/api/user'
import { getExpertSchedules, createConsultReservation } from '@/api/consultReservation'
import { useAppStore } from '@/store/app'

const tabs = [
  { key: 'all', name: '全部专家' },
  { key: 'pediatric', name: '儿科医生' },
  { key: 'psychology', name: '心理专家' },
  { key: 'education', name: '教育名师' },
  { key: 'nutrition', name: '营养顾问' },
  { key: 'parenting', name: '育儿达人' },
]

const activeTab = ref('all')

const experts = ref([])

const lectures = ref([])

const filteredExperts = computed(() => {
  if (activeTab.value === 'all') return experts.value
  return experts.value.filter((e) => e.type === activeTab.value)
})

const lecturesAnchor = ref(null)

const bookDialogVisible = ref(false)
const currentExpert = ref(null)
const currentSchedules = ref([])

const lectureBookDialogVisible = ref(false)
const currentLecture = ref(null)

const publishDialogVisible = ref(false)

const appStore = useAppStore()
const router = useRouter()

const isExpert = computed(() => {
  return appStore.role === '专家'
})

onMounted(async () => {
  await loadExperts(4)
  await loadLectures()
})

function mapExpertType(item) {
  const raw = String(item?.expertType || item?.type || item?.specialty || item?.field || '').toLowerCase()
  if (raw.includes('儿') || raw.includes('pediatric')) return 'pediatric'
  if (raw.includes('心理') || raw.includes('psychology')) return 'psychology'
  if (raw.includes('教育') || raw.includes('teacher') || raw.includes('education')) return 'education'
  if (raw.includes('营养') || raw.includes('nutrition')) return 'nutrition'
  if (raw.includes('育儿') || raw.includes('parenting')) return 'parenting'
  return 'all'
}

function mapExpertItem(item, index) {
  const avatar = normalizeImageSource(item?.avatar)
  return {
    id: item?.id,
    type: mapExpertType(item),
    name: item?.nickname || item?.username || '专家',
    tag: item?.certificationMaterials || item?.title || '认证专家',
    desc: item?.bio || item?.signature || item?.introduction || '暂无专家介绍',
    hospital: item?.company || item?.organization || item?.hospital || '平台认证专家',
    years: item?.workYears || item?.years || item?.experienceYears || 0,
    cover: avatar || `https://picsum.photos/seed/expert-${item?.id || index}/800/500`,
    avatar: avatar || '',
    raw: item,
  }
}

async function loadExperts(limit) {
  try {
    const result = await getExpertsList(limit)
    const list = Array.isArray(result) ? result : []
    experts.value = list.map(mapExpertItem)
  } catch (error) {
    console.error('获取专家列表失败:', error)
    ElMessage.error('获取专家列表失败')
  }
}

async function loadExpertSchedules(expertId) {
  const result = await getExpertSchedules(expertId)
  const list = Array.isArray(result) ? result : []
  return list.filter((item) => Number(item?.status) === 0)
}

function pickFirstImageValue(value) {
  if (Array.isArray(value)) {
    return value[0] || ''
  }

  return typeof value === 'string' ? value : ''
}

function normalizeImageSource(value) {
  const imageValue = pickFirstImageValue(value)?.trim()

  if (!imageValue) return ''
  if (imageValue.startsWith('data:')) return imageValue
  if (imageValue.startsWith('http://') || imageValue.startsWith('https://')) return imageValue
  if (imageValue.startsWith('/')) return imageValue
  if (/^[A-Za-z0-9+/=]+$/.test(imageValue) && imageValue.length > 100) {
    return `data:image/jpeg;base64,${imageValue}`
  }

  return ''
}

async function loadLectureExpertMap(records) {
  const expertIds = [...new Set(records
    .map((item) => item?.expertId)
    .filter((id) => id !== undefined && id !== null && id !== ''))]

  if (!expertIds.length) {
    return new Map()
  }

  const expertEntries = await Promise.all(expertIds.map(async (expertId) => {
    try {
      const result = await getUserById(expertId)
      const user = result?.data || result?.userInfo || result || {}
      return [String(expertId), {
        nickname: user?.nickname || user?.username || '专家',
        avatar: normalizeImageSource(user?.avatar),
      }]
    } catch (error) {
      return [String(expertId), {
        nickname: '专家',
        avatar: '',
      }]
    }
  }))

  return new Map(expertEntries)
}

async function loadLectures() {
  try {
    const res = await getLectureList(1, 10)
    if (res && res.records) {
      const expertMap = await loadLectureExpertMap(res.records)

      lectures.value = res.records.map((item) => {
        const coverUrl = normalizeImageSource(item.cover)
        const lectureExpert = expertMap.get(String(item?.expertId)) || {}
        const expertAvatarUrl = lectureExpert.avatar || normalizeImageSource(item.expertAvatar)

        const lectureTime = new Date(item.lectureTime)
        const now = new Date()
        const ended = item.status === 2 || lectureTime < now

        const statusMap = {
          0: '预告中',
          1: '直播中',
          2: '已结束',
          3: '已取消'
        }

        return {
          id: item.id,
          title: item.title,
          expert: lectureExpert.nickname || item.expertName || '专家',
          expertAvatar: expertAvatarUrl || 'https://picsum.photos/seed/lex1/100/100',
          time: formatLectureTime(item.lectureTime),
          ended: ended,
          signedUp: Boolean(item.signedUp),
          status: item.status,
          statusText: statusMap[item.status] || '预告中',
          currentParticipants: item.signUpCount || 0,
          maxSignUp: item.maxSignUp || 0,
          cover: coverUrl || 'https://picsum.photos/seed/lec1/900/600',
          description: item.description,
          location: item.location,
          streamName: item.streamName || item.streamKey || '',
        }
      })
    }
  } catch (error) {
    console.error('获取讲座列表失败:', error)
    ElMessage.error('获取讲座列表失败')
  }
}

function formatLectureTime(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${hours}:${minutes}`
}

function handleBook(expert) {
  if (!expert?.id) {
    activeTab.value = 'all'
    ElMessage.info('请选择下方专家卡片进行预约')
    return
  }

  openBookDialog(expert)
}

async function openBookDialog(expert) {
  if (!expert?.id) {
    ElMessage.warning('专家信息有误')
    return
  }

  try {
    const schedules = await loadExpertSchedules(expert.id)
    if (!schedules.length) {
      ElMessage.info('当前专家暂无可预约时段')
      return
    }

    currentExpert.value = expert
    currentSchedules.value = schedules
    bookDialogVisible.value = true
  } catch (error) {
    console.error('获取专家排班失败:', error)
    ElMessage.error(error?.message || '获取专家排班失败，请稍后重试')
  }
}

async function handleBookSubmit(payload) {
  if (!payload?.expert?.id || !payload?.form?.scheduleId) {
    ElMessage.error('预约信息不完整')
    return
  }

  try {
    await createConsultReservation({
      expertId: payload.expert.id,
      scheduleId: payload.form.scheduleId,
      consultType: payload.form.consultType,
      questionDesc: payload.form.questionDesc,
      contactInfo: payload.form.contactInfo,
    })
    ElMessage.success('预约提交成功，等待专家确认')
    bookDialogVisible.value = false
    currentSchedules.value = await loadExpertSchedules(payload.expert.id)
  } catch (error) {
    console.error('提交专家预约失败:', error)
    ElMessage.error(error?.message || '预约提交失败，请稍后重试')
  }
}

async function handleLectureAction(lecture) {
  if (lecture?.ended) {
    openLecture(lecture)
    return
  }

  if (lecture?.signedUp) {
    try {
      await cancelSignup(lecture.id)
      ElMessage.success('已取消预约')
      await loadLectures()
    } catch (error) {
      console.error('取消讲座预约失败:', error)
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('取消预约失败，请稍后重试')
      }
    }
    return
  }

  currentLecture.value = lecture ?? null
  lectureBookDialogVisible.value = true
}

async function handleLectureBookSubmit(payload) {
  if (!payload?.lecture?.id) {
    ElMessage.error('讲座信息错误')
    return
  }

  try {
    await signupLecture(payload.lecture.id)
    ElMessage.success('讲座预约成功！')
    lectureBookDialogVisible.value = false
    await loadLectures()
  } catch (error) {
    console.error('讲座预约失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('讲座预约失败，请稍后重试')
    }
  }
}

function handlePublish() {
  publishDialogVisible.value = true
}

function resolveLectureImageKey(uploadRes) {
  if (typeof uploadRes === 'string') return uploadRes

  return uploadRes?.data?.url || ''
}

async function handlePublishSubmit(payload) {
  try {
    const submitPayload = {
      title: payload?.title,
      description: payload?.description,
      lectureTime: payload?.lectureTime,
      location: payload?.location,
      maxSignUp: payload?.maxSignUp,
    }

    if (payload?.imageFile) {
      const uploadRes = await uploadLectureImage(payload.imageFile)
      const cover = resolveLectureImageKey(uploadRes)

      if (!cover) {
        throw new Error('讲座封面上传失败')
      }

      submitPayload.cover = cover
    }

    await createLecture(submitPayload)
    ElMessage.success('讲座发布成功！')
    publishDialogVisible.value = false
    await loadLectures()
  } catch (error) {
    console.error('讲座发布失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('讲座发布失败，请稍后重试')
    }
  }
}

function scrollToLectures() {
  const el = lecturesAnchor.value
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleViewAll() {
  activeTab.value = 'all'
  loadExperts()
}

function openExpert(expert) {
  openBookDialog(expert)
}

function viewExpertProfile(expert) {
  const expertId = expert?.id || expert?.raw?.id
  if (!expertId) {
    ElMessage.warning('无法获取专家信息')
    return
  }

  router.push({ name: 'user-detail', params: { userId: expertId } })
}

function openLecture(lecture) {
  if (!lecture) return

  if (!lecture.ended && !lecture.signedUp) {
    ElMessage.warning('请先预约该讲座再进入直播间')
    currentLecture.value = lecture
    lectureBookDialogVisible.value = true
    return
  }

  router.push({
    name: 'lecture-live',
    params: { id: lecture.id },
    query: {
      title: lecture.title,
      stream: lecture.streamName || 'stream01',
    },
  })
}
</script>

<style scoped>
.coach-page {
  width: 100%;
}

.coach-hero {
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

.coach-main {
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

.publish-btn {
  border-radius: 8px;
  background: rgba(168, 85, 247, 1);
  color: #fff;
  font-weight: 700;
}

.expert-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.expert-card {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.expert-cover {
  height: 200px;
  position: relative;
  background: rgba(241, 245, 249, 1);
}

.expert-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(168, 85, 247, 1);
  color: #fff;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 8px;
}

.expert-body {
  padding: 14px;
}

.expert-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.expert-name {
  font-weight: 800;
  color: rgba(30, 41, 59, 1);
}

.expert-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(241, 245, 249, 1);
  color: rgba(100, 116, 139, 1);
}

.expert-desc {
  margin-top: 10px;
  font-size: 13px;
  line-height: 20px;
  color: rgba(71, 85, 105, 1);
  height: 40px;
  overflow: hidden;
}

.expert-meta {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  color: rgba(100, 116, 139, 1);
  font-size: 12px;
}

.expert-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.outline {
  border: 1px solid rgba(168, 85, 247, 1);
  color: rgba(147, 51, 234, 1);
  border-radius: 8px;
}

.lecture-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.lecture-card {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.lecture-cover {
  height: 180px;
  position: relative;
  background: rgba(241, 245, 249, 1);
}

.lecture-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.lecture-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(34, 197, 94, 1);
  color: #fff;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 8px;
}

.play-count {
  position: absolute;
  right: 10px;
  bottom: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 8px;
}

.lecture-body {
  padding: 14px;
}

.lecture-title {
  font-size: 18px;
  font-weight: 700;
  line-height: 26px;
  color: rgba(30, 41, 59, 1);
  height: 52px;
  overflow: hidden;
}

.lecture-expert {
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

.expert {
  font-size: 14px;
  font-weight: 700;
  color: rgba(30, 41, 59, 1);
}

.lecture-footer {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.time {
  font-size: 13px;
  color: rgba(100, 116, 139, 1);
}

@media (max-width: 1280px) {
  .hero-container,
  .main-container {
    width: 100%;
    padding-left: 16px;
    padding-right: 16px;
  }

  .expert-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 860px) {
  .hero-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .lecture-grid {
    grid-template-columns: 1fr;
  }
}
</style>
