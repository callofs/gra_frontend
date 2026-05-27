<template>
  <div class="hero-carousel">
    <el-carousel height="280px" trigger="click" indicator-position="outside" arrow="always">
      <el-carousel-item v-for="item in slides" :key="item.title">
        <div class="slide" :style="{ background: item.background }">
          <div class="slide-badge">{{ item.badge }}</div>
          <div class="slide-title">{{ item.title }}</div>
          <div class="slide-desc">{{ item.description }}</div>
          <div class="slide-tags">
            <span v-for="tag in item.tags" :key="tag" class="slide-tag">{{ tag }}</span>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup>
const slides = [
  {
    badge: '专家辅导',
    title: '一站式连接专家讲座与育儿咨询',
    description: '预约专家、参与讲座、沉淀经验内容，帮助你在不同育儿阶段快速找到可靠建议。',
    tags: ['专家预约', '讲座直播', '成长指导'],
    background: 'linear-gradient(135deg, rgba(59,130,246,0.96), rgba(14,165,233,0.92))',
  },
  {
    badge: '互助社区',
    title: '和更多家长交流真实的育儿经验',
    description: '通过论坛交流、闲置互助与经验分享，让每个家庭都能获得更温暖的支持。',
    tags: ['经验交流', '互助市场', '家长社区'],
    background: 'linear-gradient(135deg, rgba(16,185,129,0.94), rgba(6,182,212,0.9))',
  },
  {
    badge: '实用工具',
    title: '聚合资讯、工具与成长资源',
    description: '精选育儿资讯与实用功能，帮助你更轻松地处理日常照护、学习与成长问题。',
    tags: ['育儿资讯', '实用工具', '成长陪伴'],
    background: 'linear-gradient(135deg, rgba(244,114,182,0.92), rgba(168,85,247,0.9))',
  },
]
</script>

<style scoped>
.hero-carousel {
  width: 100%;
  height: 280px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
}

.hero-carousel :deep(.el-carousel__arrow) {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.hero-carousel:hover :deep(.el-carousel__arrow) {
  opacity: 1;
  pointer-events: auto;
}

.slide {
  position: relative;
  height: 280px;
  padding: 32px;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.slide::after {
  content: '';
  position: absolute;
  inset: auto -40px -40px auto;
  width: 180px;
  height: 180px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  filter: blur(2px);
}

.slide-badge {
  position: relative;
  z-index: 1;
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 13px;
  font-weight: 700;
}

.slide-title {
  position: relative;
  z-index: 1;
  margin-top: 18px;
  font-size: 30px;
  line-height: 1.35;
  font-weight: 800;
}

.slide-desc {
  position: relative;
  z-index: 1;
  margin-top: 14px;
  max-width: 420px;
  font-size: 15px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.92);
}

.slide-tags {
  position: relative;
  z-index: 1;
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.slide-tag {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 13px;
}

:deep(.el-carousel),
:deep(.el-carousel__container) {
  height: 280px;
}

:deep(.el-carousel__button) {
  width: 20px;
  border-radius: 999px;
}

:deep(.el-carousel__arrow) {
  background-color: rgba(15, 23, 42, 0.28);
}

@media (max-width: 768px) {
  .hero-carousel,
  .slide,
  :deep(.el-carousel),
  :deep(.el-carousel__container) {
    height: 240px;
  }

  .slide {
    padding: 24px;
  }

  .slide-title {
    font-size: 24px;
  }

  .slide-desc {
    max-width: none;
    font-size: 14px;
  }
}
</style>
