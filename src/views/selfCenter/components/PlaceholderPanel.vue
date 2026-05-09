<template>
  <div class="placeholder-panel card">
    <div class="placeholder-badge">{{ icon }}</div>
    <div class="placeholder-title">{{ title }}</div>
    <div class="placeholder-desc">{{ description }}</div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '功能建设中',
  },
  description: {
    type: String,
    default: '该模块当前为静态展示，后续可继续拆分接入真实业务页面。',
  },
  icon: {
    type: String,
    default: '🗂',
  },
})
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.placeholder-panel {
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
}

.placeholder-badge {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #eff6ff;
  font-size: 32px;
}

.placeholder-title {
  margin-top: 18px;
  font-size: 24px;
  line-height: 1.3;
  font-weight: 700;
  color: #0f172a;
}

.placeholder-desc {
  margin-top: 10px;
  max-width: 520px;
  font-size: 14px;
  line-height: 1.8;
  color: #64748b;
}
</style>
