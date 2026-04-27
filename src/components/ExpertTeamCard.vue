<template>
  <section class="expert-section">
    <div class="head">
      <div>
        <div class="title">特邀专家团队</div>
        <div class="sub">专业人士为您的育儿之路保驾护航</div>
      </div>
      <button class="more" type="button">查看全部专家 <span>→</span></button>
    </div>

    <div class="grid">
      <article v-for="item in experts" :key="item.name" class="card">
        <div class="cover" :style="{ backgroundImage: item.cover }"></div>
        <div class="body">
          <div class="row">
            <div class="name">{{ item.name }}</div>
            <div class="score">★ {{ item.score }}</div>
          </div>
          <div class="meta">{{ item.title }}</div>
          <div class="desc">{{ item.desc }}</div>
          <div class="actions">
            <button class="primary" type="button">预约咨询</button>
            <button class="detail" type="button" aria-label="查看详情">↗</button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps({
  experts: {
    type: Array,
    required: true,
  },
})
</script>

<style scoped>
.expert-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 120px;
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
  grid-template-columns: repeat(4, 1fr);
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
  height: 200px;
  background-size: cover;
  background-position: center;
}

.body {
  padding: 20px;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.name {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.score {
  font-size: 14px;
  color: #ca8a04;
  font-weight: 700;
}

.meta {
  margin-top: 8px;
  color: #64748b;
  font-size: 14px;
}

.desc {
  margin-top: 12px;
  color: #475569;
  font-size: 13px;
  line-height: 1.6;
  min-height: 42px;
}

.actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}

.primary {
  flex: 1;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: #a855f7;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.detail {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  cursor: pointer;
}

@media (max-width: 1200px) {
  .expert-section {
    padding: 48px 16px;
  }

  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 680px) {
  .head {
    align-items: flex-start;
    flex-direction: column;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
