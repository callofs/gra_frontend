<template>
  <section class="panel card">
    <div class="panel-header">
      <div>
        <div class="panel-title">板块管理</div>
        <div class="panel-subtitle">控制社区板块启停、排序与版主配置。</div>
      </div>
      <el-button type="primary" @click="emit('create')">新增板块</el-button>
    </div>

    <div class="table-list">
      <div v-for="item in items" :key="item.id" class="table-row">
        <div class="row-main">
          <div class="row-title">{{ item.name }}</div>
          <div class="row-meta">版主：{{ item.owner }} · 贴文数：{{ item.postCount }} · 排序：{{ item.sort }}</div>
        </div>
        <el-tag :type="item.enabled ? 'success' : 'info'">{{ item.enabled ? '已启用' : '已停用' }}</el-tag>
        <div class="row-actions">
          <el-button size="small" @click="emit('edit', item.name)">编辑</el-button>
          <el-button size="small" :type="item.enabled ? 'warning' : 'success'" @click="emit('toggle', item)">
            {{ item.enabled ? '停用' : '启用' }}
          </el-button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['create', 'edit', 'toggle'])
</script>

<style scoped>
.card {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.panel {
  padding: 24px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.panel-title {
  font-size: 22px;
  font-weight: 800;
  color: rgba(15, 23, 42, 1);
}

.panel-subtitle {
  margin-top: 6px;
  font-size: 14px;
  color: rgba(100, 116, 139, 1);
}

.table-list {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.table-row {
  padding: 16px 18px;
  border: 1px solid rgba(226, 232, 240, 1);
  border-radius: 12px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 16px;
}

.row-main {
  min-width: 0;
}

.row-title {
  font-size: 16px;
  font-weight: 700;
  color: rgba(15, 23, 42, 1);
}

.row-meta {
  margin-top: 6px;
  font-size: 13px;
  color: rgba(100, 116, 139, 1);
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 860px) {
  .panel-header,
  .table-row {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .row-actions {
    justify-content: flex-start;
  }
}
</style>
