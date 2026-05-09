<template>
  <section class="feature-panel card">
    <div class="feature-header">
      <div class="feature-icon">{{ icon }}</div>
      <div>
        <div class="feature-title">{{ title }}</div>
        <div class="feature-subtitle">{{ subtitle }}</div>
      </div>
    </div>

    <div class="feature-grid">
      <div v-for="item in items" :key="item.label" class="feature-item">
        <div class="feature-label">{{ item.label }}</div>
        <div class="feature-value">{{ item.value }}</div>
      </div>
    </div>

    <div class="feature-footer">{{ description }}</div>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '🗂',
  },
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.feature-panel {
  padding: 24px;
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: #eff6ff;
  font-size: 28px;
}

.feature-title {
  font-size: 24px;
  line-height: 1.3;
  font-weight: 700;
  color: #0f172a;
}

.feature-subtitle {
  margin-top: 6px;
  font-size: 14px;
  color: #64748b;
}

.feature-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.feature-item {
  padding: 18px;
  border-radius: 12px;
  background: #f8fafc;
}

.feature-label {
  font-size: 13px;
  color: #64748b;
}

.feature-value {
  margin-top: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.feature-footer {
  margin-top: 24px;
  padding: 16px 18px;
  border-radius: 12px;
  background: #eff6ff;
  color: #475569;
  line-height: 1.8;
  font-size: 14px;
}

@media (max-width: 768px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
