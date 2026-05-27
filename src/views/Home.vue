<template>
  <div class="page">
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-text">
          <div class="hero-title">让育儿更轻松，让成长更有方向</div>
          <div class="hero-sub">汇聚家长经验、专家课程与实用工具，陪你一起解决育儿难题。</div>
          <div class="hero-actions">
            <button class="btn primary" type="button" @click="goForum">立即加入</button>
            <button class="btn" type="button" @click="goCourses">了解更多</button>
          </div>
        </div>
        <div class="hero-img">
          <HomeHeroCarousel />
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-title">核心功能，一站式育儿支持</div>
        <div class="section-sub">论坛交流、互助市场、专家辅导、育儿资讯与工具服务，覆盖育儿全场景。</div>

        <div class="cards">
          <button class="card" type="button" @click="goForum">
            <div class="icon">💬</div>
            <div class="card-title">主题论坛</div>
            <div class="card-sub">分享经验、提问交流，和更多家长一起成长。</div>
          </button>
          <button class="card" type="button" @click="goMarket">
            <div class="icon">🛍️</div>
            <div class="card-title">互助市场</div>
            <div class="card-sub">闲置互换、服务互助，让资源流动起来。</div>
          </button>
          <button class="card" type="button" @click="goLectures">
            <div class="icon">🧑‍⚕️</div>
            <div class="card-title">专家辅导</div>
            <div class="card-sub">专业建议与讲座课程，解决关键育儿问题。</div>
          </button>
          <button class="card" type="button" @click="goCourses">
            <div class="icon">📰</div>
            <div class="card-title">育儿资讯</div>
            <div class="card-sub">精选干货与热点科普，持续更新。</div>
          </button>
        </div>
      </div>
    </section>

    <ExpertTeamCard :experts="experts" />

    <NewsSection />

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ExpertTeamCard from '../components/ExpertTeamCard.vue'
import HomeHeroCarousel from '@/components/HomeHeroCarousel.vue'
import NewsSection from '@/components/NewsSection.vue'
import AppFooter from '@/components/AppFooter.vue'
import { getExpertsList } from '@/api/user'

const router = useRouter()

const experts = ref([])

const coverGradients = [
  'linear-gradient(135deg, rgba(59,130,246,.28), rgba(34,211,238,.24)), radial-gradient(220px 120px at 70% 30%, rgba(255,255,255,.38), transparent 60%)',
  'linear-gradient(135deg, rgba(16,185,129,.24), rgba(59,130,246,.2)), radial-gradient(200px 120px at 75% 35%, rgba(255,255,255,.38), transparent 60%)',
  'linear-gradient(135deg, rgba(244,114,182,.2), rgba(168,85,247,.24)), radial-gradient(220px 120px at 72% 32%, rgba(255,255,255,.38), transparent 60%)',
  'linear-gradient(135deg, rgba(245,158,11,.24), rgba(251,191,36,.2)), radial-gradient(220px 120px at 72% 32%, rgba(255,255,255,.36), transparent 60%)',
]

onMounted(async () => {
  try {
    const res = await getExpertsList(4)
    if (res && res.length > 0) {
      experts.value = res.map((item, index) => {
        let avatarUrl = ''
        if (item.avatar && item.avatar.length > 0) {
          const avatarData = item.avatar
          if (avatarData && !avatarData.startsWith('data:')) {
            avatarUrl = `data:image/jpeg;base64,${avatarData}`
          } else {
            avatarUrl = avatarData || ''
          }
        }
        return {
          name: item.nickname || item.username,
          score: item.creditScore ? item.creditScore.toString() : '4.8',
          title: item.certificationMaterials || '资深专家',
          desc: `粉丝数: ${item.followerCount || 0} | 关注数: ${item.followCount || 0}`,
          cover: coverGradients[index % coverGradients.length],
          avatar: avatarUrl,
        }
      })
    }
  } catch (error) {
    console.error('获取专家列表失败:', error)
  }
})

function goHome() {
  router.push('/home')
}

function goForum() {
  router.push('/forum')
}

function goMarket() {
  router.push('/market')
}

function goLectures() {
  router.push('/lectures')
}

function goCourses() {
  router.push('/courses')
}

function goProfile() {
  router.push('/profile')
}
</script>

<style scoped>
.page {
  background: rgba(248, 250, 252, 1);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 120px;
}

.hero {
  padding: 92px 0;
}

.hero-inner {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: 48px;
}

.hero-title {
  font-size: 44px;
  line-height: 1.18;
  font-weight: 900;
  color: rgba(15, 23, 42, 1);
}

.hero-sub {
  margin-top: 16px;
  font-size: 16px;
  line-height: 1.7;
  color: rgba(71, 85, 105, 1);
}

.hero-actions {
  margin-top: 28px;
  display: flex;
  gap: 16px;
}

.btn {
  height: 46px;
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 1);
  background: #fff;
  color: rgba(30, 41, 59, 1);
  font-weight: 800;
  cursor: pointer;
}

.btn.primary {
  border: none;
  background: rgba(59, 130, 246, 1);
  color: #fff;
}

.hero-img {
  width: 100%;
  min-height: 280px;
}

.section {
  padding: 64px 0 84px;
}

.section-title {
  font-size: 28px;
  font-weight: 900;
  text-align: center;
  color: rgba(15, 23, 42, 1);
}

.section-sub {
  margin-top: 10px;
  text-align: center;
  color: rgba(100, 116, 139, 1);
  line-height: 1.7;
}

.cards {
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.card {
  text-align: left;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 1);
  background: #fff;
  padding: 18px;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.18);
  font-size: 22px;
}

.card-title {
  margin-top: 14px;
  font-size: 18px;
  font-weight: 900;
  color: rgba(15, 23, 42, 1);
}

.card-sub {
  margin-top: 10px;
  font-size: 13px;
  color: rgba(71, 85, 105, 1);
  line-height: 1.65;
}

@media (max-width: 1200px) {
  .container {
    padding: 0 16px;
  }

  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 680px) {
  .hero-inner {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 32px;
  }

  .cards {
    grid-template-columns: 1fr;
  }
}
</style>
