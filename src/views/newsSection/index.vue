<template>
  <div class="news-page">
    <div class="container page-body">
      <main class="main-column">
        <section class="hero-card">
          <img
            class="hero-image"
            src="https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046056506955468800.jpg"
            alt="教育部发布最新幼儿园入学指导意见"
          />
          <div class="hero-content">
            <div class="hero-tag">政策动态</div>
            <h1 class="hero-title">教育部发布最新幼儿园入学指导意见，这些变化家长需要了解</h1>
            <p class="hero-desc">
              近日，教育部发布了最新的幼儿园入学指导意见，对入园年龄、招生流程、收费标准等方面做出了新的规定，将进一步规范幼儿园办学行为，帮助家长更清晰地了解入园相关政策与准备事项。
            </p>
            <div class="hero-footer">
              <div class="hero-date">2026-04-18</div>
              <button class="read-btn" type="button">阅读全文</button>
            </div>
          </div>
        </section>

        <section class="news-list">
          <article v-for="item in newsList" :key="item.title" class="news-item">
            <img class="news-image" :src="item.image" :alt="item.title" />
            <div class="news-content">
              <div class="news-tag" :class="item.tagClass">{{ item.tag }}</div>
              <h2 class="news-title">{{ item.title }}</h2>
              <p class="news-desc">{{ item.desc }}</p>
              <div class="news-meta">
                <span>{{ item.date }}</span>
                <button class="plain-link" type="button">阅读全文</button>
              </div>
            </div>
          </article>
        </section>
      </main>

      <aside class="side-column">
        <section class="panel">
          <div class="panel-title">热门资讯</div>
          <div class="hot-list">
            <div v-for="(item, index) in hotList" :key="item.title" class="hot-item">
              <div class="hot-rank">{{ index + 1 }}</div>
              <div>
                <div class="hot-title">{{ item.title }}</div>
                <div class="hot-meta">{{ item.views }}</div>
              </div>
            </div>
          </div>
        </section>

        <section class="subscribe-card">
          <div class="subscribe-title">订阅育儿资讯</div>
          <div class="subscribe-desc">每日推送精选育儿知识，不错过重要育儿信息</div>
          <button class="subscribe-btn" type="button">立即订阅</button>
        </section>

        <section class="panel">
          <div class="panel-title">专题推荐</div>
          <div class="topic-list">
            <article v-for="item in topicList" :key="item.title" class="topic-item">
              <img class="topic-image" :src="item.image" :alt="item.title" />
              <div class="topic-body">
                <div class="topic-title">{{ item.title }}</div>
                <div class="topic-meta">{{ item.meta }}</div>
              </div>
            </article>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
const newsList = [
  {
    tag: '健康医疗',
    tagClass: 'green',
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046056541067124736.jpg',
    title: '2026年儿童疫苗接种计划更新，新增两种疫苗纳入免费接种范围',
    desc: '国家卫健委今日发布通知，自2026年6月1日起，将两种新型疫苗纳入国家免疫规划，适用于6个月至5岁儿童，家长可携带孩子到就近社区卫生服务中心免费接种。',
    date: '2026-04-15',
  },
  {
    tag: '科学育儿',
    tagClass: 'orange',
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046056586152316928.jpg',
    title: '研究表明：每天亲子阅读15分钟，孩子未来学习能力提升30%',
    desc: '最新研究显示，从婴幼儿时期坚持每天15分钟的亲子阅读，能够显著提升孩子的语言表达能力、理解能力和逻辑思维能力。',
    date: '2026-04-12',
  },
  {
    tag: '成长教育',
    tagClass: 'blue',
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046056506955468800.jpg',
    title: '如何帮助孩子建立稳定作息？家长必看的家庭节律管理方法',
    desc: '围绕睡眠、饮食、运动和情绪节律，建立科学稳定的家庭作息，可以帮助孩子更好地适应学习与成长环境。',
    date: '2026-04-10',
  },
]

const hotList = [
  { title: '孩子总是拖延写作业怎么办？', views: '5.8万阅读' },
  { title: '幼儿园入园前，家长要提前准备哪些能力？', views: '4.6万阅读' },
  { title: '春季儿童过敏高发，预防方法请收好', views: '4.1万阅读' },
  { title: '亲子沟通中最常见的3个误区', views: '3.8万阅读' },
  { title: '三岁看老，这几个好习惯一定要从小培养', views: '3.5万阅读' },
]

const topicList = [
  {
    title: '儿童安全防护全攻略',
    meta: '12篇文章 · 3.2万人已读',
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046062578641903616.jpg',
  },
  {
    title: '亲子沟通技巧大全',
    meta: '18篇文章 · 2.8万人已读',
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046056586152316928.jpg',
  },
  {
    title: '儿童营养搭配指南',
    meta: '15篇文章 · 2.5万人已读',
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046056541067124736.jpg',
  },
]
</script>

<style scoped>
.news-page {
  background: #f8fafc;
  min-height: 100vh;
  padding: 32px 0 64px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 120px;
}

.page-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 32px;
  align-items: start;
}

.main-column {
  min-width: 0;
}

.hero-card,
.news-item,
.panel {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.hero-card {
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 360px;
  object-fit: cover;
  display: block;
}

.hero-content {
  padding: 32px;
}

.hero-tag,
.news-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.hero-tag,
.news-tag.blue {
  background: #dbeafe;
  color: #2563eb;
}

.news-tag.green {
  background: #dcfce7;
  color: #16a34a;
}

.news-tag.orange {
  background: #ffedd5;
  color: #ea580c;
}

.hero-title {
  margin: 16px 0 0;
  font-size: 32px;
  line-height: 1.4;
  font-weight: 900;
  color: #1e293b;
}

.hero-desc {
  margin-top: 16px;
  font-size: 15px;
  line-height: 1.8;
  color: #64748b;
}

.hero-footer,
.news-meta {
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: #94a3b8;
  font-size: 14px;
}

.read-btn,
.subscribe-btn {
  height: 40px;
  border: none;
  border-radius: 8px;
  background: #3b82f6;
  color: #fff;
  font-weight: 700;
  padding: 0 16px;
  cursor: pointer;
}

.news-list {
  margin-top: 32px;
  display: grid;
  gap: 20px;
}

.news-item {
  padding: 20px;
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  gap: 20px;
}

.news-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
}

.news-title {
  margin: 12px 0 0;
  font-size: 22px;
  line-height: 1.45;
  font-weight: 800;
  color: #1e293b;
}

.news-desc {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.7;
  color: #64748b;
}

.plain-link {
  border: none;
  background: transparent;
  color: #3b82f6;
  font-weight: 700;
  cursor: pointer;
}

.side-column {
  display: grid;
  gap: 24px;
}

.panel {
  padding: 20px;
}

.panel-title {
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
}

.hot-list,
.topic-list {
  margin-top: 16px;
  display: grid;
  gap: 16px;
}

.hot-item {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.hot-rank {
  font-size: 18px;
  line-height: 1;
  font-weight: 900;
  color: #64748b;
}

.hot-title,
.topic-title {
  font-size: 14px;
  line-height: 1.5;
  font-weight: 600;
  color: #1e293b;
}

.hot-meta,
.topic-meta {
  margin-top: 4px;
  font-size: 12px;
  color: #94a3b8;
}

.subscribe-card {
  border-radius: 12px;
  background: linear-gradient(180deg, #3b82f6 0%, #38bdf8 100%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 24px;
  text-align: center;
}

.subscribe-title {
  font-size: 20px;
  font-weight: 900;
  color: #fff;
}

.subscribe-desc {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.7;
  color: #f1f5f9;
}

.subscribe-btn {
  margin-top: 20px;
  background: #fff;
  color: #2563eb;
}

.topic-item {
  overflow: hidden;
  border-radius: 8px;
  background: #f8fafc;
}

.topic-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.topic-body {
  padding: 12px;
}

@media (max-width: 1200px) {
  .container {
    padding: 0 16px;
  }

  .page-body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .news-item {
    grid-template-columns: 1fr;
  }

  .hero-image {
    height: 240px;
  }

  .hero-content {
    padding: 20px;
  }

  .hero-title {
    font-size: 24px;
  }
}
</style>
