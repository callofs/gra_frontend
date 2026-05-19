<template>
  <section class="panel card">
    <div class="panel-header">
      <div>
        <div class="panel-title">认证材料审核</div>
        <div class="panel-subtitle">审核专家提交的认证文件与资质说明。</div>
      </div>
    </div>

    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜索姓名 / 专长方向" clearable class="toolbar-input" />
      <el-select v-model="status" class="toolbar-select">
        <el-option label="全部状态" value="all" />
        <el-option label="待审核" value="pending" />
        <el-option label="已通过" value="approved" />
        <el-option label="已驳回" value="rejected" />
      </el-select>
    </div>

    <div class="table-list">
      <div v-for="item in filteredItems" :key="item.id" class="table-row">
        <div class="row-main">
          <div class="row-title">{{ item.name }} · {{ item.field }}</div>
          <div class="row-meta">提交时间：{{ item.submitTime }} · 文件：{{ item.fileName }}</div>
        </div>
        <el-tag :type="statusTypeMap[item.status]">{{ statusLabelMap[item.status] }}</el-tag>
        <div class="row-actions">
          <el-button size="small" @click="emit('preview', '认证材料', item.name)">预览</el-button>
          <el-button size="small" type="success" @click="emit('approve', '认证材料', item.name)">通过</el-button>
          <el-button size="small" type="danger" @click="emit('reject', '认证材料', item.name)">驳回</el-button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  statusLabelMap: {
    type: Object,
    required: true,
  },
  statusTypeMap: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['preview', 'approve', 'reject'])

const keyword = ref('')
const status = ref('all')

const filteredItems = computed(() => {
  return props.items.filter((item) => {
    const matchStatus = status.value === 'all' || item.status === status.value
    const currentKeyword = keyword.value.trim()
    const matchKeyword = !currentKeyword || item.name.includes(currentKeyword) || item.field.includes(currentKeyword)
    return matchStatus && matchKeyword
  })
})
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

.toolbar {
  margin-top: 18px;
  display: flex;
  gap: 12px;
}

.toolbar-input {
  width: 280px;
}

.toolbar-select {
  width: 180px;
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
  .table-row,
  .toolbar {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .row-actions {
    justify-content: flex-start;
  }

  .toolbar-input,
  .toolbar-select {
    width: 100%;
  }
}
</style>
