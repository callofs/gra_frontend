<template>
  <section class="news-section">
    <div class="head">
      <div>
        <div class="title">最新育儿资讯</div>
        <div class="sub">了解最新育儿政策和科学育儿知识</div>
      </div>
      <button class="more" type="button" @click="goNewsSection">查看更多资讯 <span>→</span></button>
    </div>

    <div class="grid">
      <article v-for="item in newsList" :key="item.title" class="card">
        <img class="cover" :src="item.image" :alt="item.title" />
        <div class="body">
          <div class="card-title">{{ item.title }}</div>
          <div class="desc">{{ item.desc }}</div>
          <div class="meta">
            <div class="meta-item">
              <span class="meta-icon">🗓</span>
              <span>{{ item.date }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">👁</span>
              <span>{{ item.views }}</span>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const newsList = [
  {
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046056506955468800.jpg',
    title: '教育部发布最新幼儿园入学指导意见，这些变化家长需要了解',
    desc: '近日，教育部发布了最新的幼儿园入学指导意见，对入园年龄、招生流程、收费标准等方面做出了新的规定，将进一步规范幼儿园办学行为...',
    date: '2026-04-18',
    views: '1.5k',
  },
  {
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046056541067124736.jpg',
    title: '2026年儿童疫苗接种计划更新，新增两种疫苗纳入免费接种范围',
    desc: '国家卫健委今日发布通知，自2026年6月1日起，将两种新型疫苗纳入国家免疫规划，适用于6个月至5岁儿童，家长可携带孩子到就近社区卫生服务中心免费接种...',
    date: '2026-04-15',
    views: '3.2k',
  },
  {
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046056586152316928.jpg',
    title: '研究表明：每天亲子阅读15分钟，孩子未来学习能力提升30%',
    desc: '最新发表在《儿童发展》期刊上的研究显示，从婴幼儿时期坚持每天15分钟的亲子阅读，能够显著提升孩子的语言表达能力、理解能力和逻辑思维能力，对未来学习成绩有积极影响...',
    date: '2026-04-12',
    views: '2.7k',
  },
]

function goNewsSection() {
  router.push('/news-section')
}
</script>

<style scoped>
.news-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 120px;
  background: #fff;
}

.head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.title {
  font-size: 28px;
  font-weight: 900;
  color: #1e293b;
}

.sub {
  margin-top: 4px;
  color: #64748b;
  font-size: 14px;
}

.more {
  height: 36px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
  padding: 0 16px;
  cursor: pointer;
}

.grid {
  margin-top: 32px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.cover {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.body {
  padding: 20px;
}

.card-title {
  min-height: 52px;
  font-size: 18px;
  line-height: 1.45;
  font-weight: 700;
  color: #1e293b;
}

.desc {
  margin-top: 8px;
  min-height: 66px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

.meta {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  color: #94a3b8;
  font-size: 13px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  font-size: 14px;
}

@media (max-width: 1200px) {
  .news-section {
    padding: 48px 16px;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .head {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
