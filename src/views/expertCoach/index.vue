<template>
  <div class="coach-page">
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
              <div class="expert-cover">
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
          </div>

          <div class="lecture-grid">
            <article v-for="l in lectures" :key="l.id" class="lecture-card" @click="openLecture(l)">
              <div class="lecture-cover">
                <div class="lecture-tag">可回放</div>
                <div class="play-count">已播放 {{ l.playCount }}</div>
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
                  <el-button size="small" type="primary" @click.stop="openLecture(l)">
                    {{ l.ended ? '观看回放' : '立即预约' }}
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
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'

const tabs = [
  { key: 'all', name: '全部专家' },
  { key: 'pediatric', name: '儿科医生' },
  { key: 'psychology', name: '心理专家' },
  { key: 'education', name: '教育名师' },
  { key: 'nutrition', name: '营养顾问' },
  { key: 'parenting', name: '育儿达人' },
]

const activeTab = ref('all')

const experts = ref([
  {
    id: 1,
    type: 'pediatric',
    name: '张医生',
    tag: '儿科主任医师',
    desc: '擅长儿童常见病诊疗、疫苗咨询与成长评估。',
    hospital: '三甲医院',
    years: 12,
    cover: 'https://picsum.photos/seed/ex1/800/500',
  },
  {
    id: 2,
    type: 'psychology',
    name: '李教授',
    tag: '心理学博士',
    desc: '专注亲子沟通、情绪管理与青春期心理辅导。',
    hospital: '高校心理中心',
    years: 10,
    cover: 'https://picsum.photos/seed/ex2/800/500',
  },
  {
    id: 3,
    type: 'education',
    name: '王老师',
    tag: '教育名师',
    desc: '学习习惯养成、幼小衔接与学习规划咨询。',
    hospital: '教育机构',
    years: 8,
    cover: 'https://picsum.photos/seed/ex3/800/500',
  },
  {
    id: 4,
    type: 'nutrition',
    name: '刘营养师',
    tag: '注册营养师',
    desc: '不同年龄段营养搭配、过敏与挑食问题指导。',
    hospital: '营养协会',
    years: 7,
    cover: 'https://picsum.photos/seed/ex4/800/500',
  },
])

const lectures = ref([
  {
    id: 1,
    title: '不同年龄段儿童营养搭配指南，让孩子健康长高高',
    expert: '刘营养师 · 注册营养师',
    expertAvatar: 'https://picsum.photos/seed/lex1/100/100',
    time: '04月18日 已结束',
    ended: true,
    playCount: '5.6万次',
    cover: 'https://picsum.photos/seed/lec1/900/600',
  },
  {
    id: 2,
    title: '如何与青春期孩子有效沟通，建立良好亲子关系',
    expert: '李教授 · 心理学博士',
    expertAvatar: 'https://picsum.photos/seed/lex2/100/100',
    time: '04月22日 20:00-21:30',
    ended: false,
    playCount: '3.2万次',
    cover: 'https://picsum.photos/seed/lec2/900/600',
  },
  {
    id: 3,
    title: '婴幼儿常见疾病预防与家庭护理要点，一次讲清楚',
    expert: '张医生 · 儿科主任医师',
    expertAvatar: 'https://picsum.photos/seed/lex3/100/100',
    time: '05月02日 19:30-21:00',
    ended: false,
    playCount: '2.1万次',
    cover: 'https://picsum.photos/seed/lec3/900/600',
  },
])

const filteredExperts = computed(() => {
  if (activeTab.value === 'all') return experts.value
  return experts.value.filter((e) => e.type === activeTab.value)
})

const lecturesAnchor = ref(null)

function handleBook(expert) {
  if (expert?.name) {
    ElMessage.info(`预约专家：${expert.name}（待接入后端）`)
    return
  }
  ElMessage.info('预约专家：待接入后端')
}

function scrollToLectures() {
  const el = lecturesAnchor.value
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleViewAll() {
  ElMessage.info('查看全部专家：待接入后端')
}

function openExpert(expert) {
  ElMessage.info(`打开专家：${expert.name}`)
}

function openLecture(lecture) {
  ElMessage.info(`打开讲座：${lecture.title}`)
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
