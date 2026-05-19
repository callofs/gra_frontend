<template>
  <div class="courses-page">
    <EnrollDialog v-model="enrollDialogVisible" :course="currentCourse" @submit="handleEnrollSubmit" />
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

          <div class="course-grid">
            <article v-for="c in filteredCourses" :key="c.id" class="course-card" @click="openCourse(c)">
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
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import EnrollDialog from './components/EnrollDialog.vue'

const tabs = [
  { key: 'all', name: '全部课程' },
  { key: 'newborn', name: '新生儿护理' },
  { key: 'nutrition', name: '营养喂养' },
  { key: 'psychology', name: '心理成长' },
  { key: 'education', name: '学习方法' },
]

const activeTab = ref('all')

const courses = ref([
  {
    id: 1,
    type: 'newborn',
    badge: '热门',
    title: '新生儿护理入门：睡眠、喂养与常见问题应对',
    instructor: '张医生 · 儿科主任医师',
    instructorAvatar: 'https://picsum.photos/seed/ca1/100/100',
    level: '入门',
    duration: '共 12 讲 · 2.5 小时',
    priceText: '免费',
    cover: 'https://picsum.photos/seed/cc1/900/600',
  },
  {
    id: 2,
    type: 'nutrition',
    badge: '精选',
    title: '不同年龄段营养搭配：挑食、过敏与长高方案',
    instructor: '刘营养师 · 注册营养师',
    instructorAvatar: 'https://picsum.photos/seed/ca2/100/100',
    level: '进阶',
    duration: '共 16 讲 · 3.2 小时',
    priceText: '免费',
    cover: 'https://picsum.photos/seed/cc2/900/600',
  },
  {
    id: 3,
    type: 'psychology',
    badge: '新课',
    title: '亲子沟通训练：情绪管理与青春期冲突化解',
    instructor: '李教授 · 心理学博士',
    instructorAvatar: 'https://picsum.photos/seed/ca3/100/100',
    level: '进阶',
    duration: '共 10 讲 · 2.0 小时',
    priceText: '免费',
    cover: 'https://picsum.photos/seed/cc3/900/600',
  },
  {
    id: 4,
    type: 'education',
    badge: '',
    title: '学习习惯养成：从专注力到时间管理的系统训练',
    instructor: '王老师 · 教育名师',
    instructorAvatar: 'https://picsum.photos/seed/ca4/100/100',
    level: '入门',
    duration: '共 14 讲 · 2.8 小时',
    priceText: '免费',
    cover: 'https://picsum.photos/seed/cc4/900/600',
  },
])

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

const coursesAnchor = ref(null)
const topicsAnchor = ref(null)

const enrollDialogVisible = ref(false)
const currentCourse = ref(null)

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
  ElMessage.info('查看全部课程：待接入后端')
}

function openCourse(course) {
  ElMessage.info(`打开课程：${course.title}`)
}

function enrollCourse(course) {
  currentCourse.value = course ?? null
  enrollDialogVisible.value = true
}

function handleEnrollSubmit(payload) {
  const title = payload?.course?.title
  ElMessage.success(title ? `已提交报名：${title}（待接入后端）` : '已提交报名（待接入后端）')
}

function openTopic(topic) {
  ElMessage.info(`打开专题：${topic.title}`)
}
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
