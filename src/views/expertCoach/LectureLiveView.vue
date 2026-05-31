<template>
  <div class="lecture-live-page">
    <header class="live-hero">
      <div class="hero-content">
        <button class="back-btn" type="button" @click="goBack">返回</button>
        <div class="hero-texts">
          <p class="live-label">专家讲座 · 直播</p>
          <h1 class="live-title">{{ lectureTitle }}</h1>
          <p class="live-meta">流名称：{{ streamName }}</p>
        </div>
      </div>
    </header>

    <main class="live-main">
      <section class="player-section">
        <LivePlayer :url="liveUrl" autoplay muted />
      </section>

      <section class="live-info">
        <h2>观看指南</h2>
        <ul>
          <li>请保持网络畅通，建议使用有线或 5G/Wi-Fi。</li>
          <li>如遇到卡顿可尝试刷新页面或重新进入直播间。</li>
          <li>本直播流基于 SRS + OBS，如需推流请联系管理员获取流名称。</li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LivePlayer from '@/components/LivePlayer.vue'

const route = useRoute()
const router = useRouter()

const DEFAULT_STREAM = 'stream01'
const BASE_URL = 'http://127.0.0.1:8090/live'

const lectureTitle = computed(() => {
  return route.query.title || `讲座 #${route.params.id || ''}`
})

const streamName = computed(() => {
  return route.query.stream || DEFAULT_STREAM
})

const liveUrl = computed(() => {
  return `${BASE_URL}/${streamName.value}.flv`
})

function goBack() {
  router.back()
}
</script>

<style scoped>
.lecture-live-page {
  min-height: 100vh;
  background: #f8fafc;
}

.live-hero {
  background: linear-gradient(120deg, #38bdf8, #6366f1);
  color: #fff;
  padding: 48px 0;
}

.hero-content {
  width: min(1200px, 94vw);
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 24px;
}

.back-btn {
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  padding: 10px 18px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.hero-texts {
  flex: 1;
}

.live-label {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 13px;
  opacity: 0.9;
}

.live-title {
  font-size: clamp(26px, 4vw, 40px);
  margin: 6px 0 4px;
  font-weight: 800;
}

.live-meta {
  opacity: 0.9;
}

.live-main {
  width: min(1200px, 94vw);
  margin: 28px auto 60px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.player-section {
  background: #fff;
  border-radius: 24px;
  padding: 18px;
  box-shadow: 0 10px 35px rgba(15, 23, 42, 0.08);
}

.live-info {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

.live-info h2 {
  margin-bottom: 12px;
  font-size: 18px;
  color: #0f172a;
}

.live-info ul {
  list-style: disc;
  padding-left: 20px;
  color: #475569;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .back-btn {
    align-self: flex-start;
  }
}
</style>
