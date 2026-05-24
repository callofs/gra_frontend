<template>
  <section class="panel card">
    <div class="panel-header">
      <div>
        <div class="panel-title">板块管理</div>
        <div class="panel-subtitle">按字典类型管理社区模块，支持新增与编辑排序。</div>
      </div>
      <div class="header-actions">
        <el-button :loading="loading" @click="fetchDictGroups">刷新</el-button>
        <el-button type="primary" @click="openCreateDialog">新增板块</el-button>
      </div>
    </div>

    <div v-loading="loading" class="group-list">
      <div v-if="!loading && groupedItems.length === 0" class="empty-state">暂无模块数据</div>

      <div v-for="group in groupedItems" :key="group.dictType" class="group-card">
        <div class="group-header">
          <div class="group-title">{{ mapDictTypeLabel(group.dictType) }}</div>
          <el-tag type="info">{{ group.items.length }} 项</el-tag>
        </div>

        <div class="table-list">
          <div v-for="item in group.items" :key="item.id" class="table-row">
            <div class="row-main">
              <div class="row-title">{{ item.dictName }}</div>
              <div class="row-meta">
                编码：{{ item.dictCode || '-' }} · 排序：{{ item.sort ?? 0 }} · 创建时间：{{ formatDateTime(item.createTime) }}
              </div>
            </div>
            <el-tag>{{ mapDictTypeLabel(item.dictType) }}</el-tag>
            <div class="row-actions">
              <el-button size="small" @click="openEditDialog(item)">编辑</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增板块' : '编辑板块'" width="460px">
      <el-form label-width="88px" :model="form">
        <el-form-item v-if="dialogMode === 'create'" label="字典类型">
          <el-input v-model="form.dictType" placeholder="请输入 dictType" />
        </el-form-item>
        <el-form-item v-if="dialogMode === 'create'" label="字典编码">
          <el-input v-model="form.dictCode" placeholder="请输入 dictCode" />
        </el-form-item>
        <el-form-item label="模块名称">
          <el-input v-model="form.dictName" placeholder="请输入模块名称" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :step="1" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { addDict, getAllDictList, updateDict } from '@/api/dict.js'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref('create')
const currentEditId = ref(null)
const rawItems = ref([])

const dictTypeLabelMap = {
  forum: '主题论坛',
  idleGoods: '闲置物品',
}

const form = reactive({
  dictType: '',
  dictCode: '',
  dictName: '',
  sort: 0,
})

const groupedItems = computed(() => {
  const groups = rawItems.value.reduce((acc, item) => {
    const dictType = item?.dictType || '未分类'
    if (!acc[dictType]) {
      acc[dictType] = []
    }
    acc[dictType].push(item)
    return acc
  }, {})

  return Object.entries(groups).map(([dictType, items]) => ({
    dictType,
    items: [...items].sort((a, b) => Number(a?.sort || 0) - Number(b?.sort || 0)),
  }))
})

function normalizeList(res) {
  return Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
}

function formatDateTime(value) {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 19)
}

function mapDictTypeLabel(dictType) {
  return dictTypeLabelMap[dictType] || dictType || '未分类'
}

function resetForm() {
  form.dictType = ''
  form.dictCode = ''
  form.dictName = ''
  form.sort = 0
  currentEditId.value = null
}

function openCreateDialog() {
  dialogMode.value = 'create'
  resetForm()
  dialogVisible.value = true
}

function openEditDialog(item) {
  dialogMode.value = 'edit'
  currentEditId.value = item.id
  form.dictType = item.dictType || ''
  form.dictCode = item.dictCode || ''
  form.dictName = item.dictName || ''
  form.sort = Number(item.sort || 0)
  dialogVisible.value = true
}

async function fetchDictGroups() {
  loading.value = true
  try {
    const res = await getAllDictList()
    rawItems.value = normalizeList(res)
  } catch (error) {
    rawItems.value = []
    ElMessage.error(error?.message || '获取模块列表失败')
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!String(form.dictName || '').trim()) {
    ElMessage.warning('请输入模块名称')
    return
  }

  if (dialogMode.value === 'create') {
    if (!String(form.dictType || '').trim()) {
      ElMessage.warning('请输入字典类型')
      return
    }
    if (!String(form.dictCode || '').trim()) {
      ElMessage.warning('请输入字典编码')
      return
    }
  }

  submitLoading.value = true
  try {
    if (dialogMode.value === 'create') {
      await addDict({
        dictType: String(form.dictType).trim(),
        dictCode: String(form.dictCode).trim(),
        dictName: String(form.dictName).trim(),
        sort: Number(form.sort || 0),
      })
      ElMessage.success('新增模块成功')
    } else {
      await updateDict(
        {
          dictName: String(form.dictName).trim(),
          sort: Number(form.sort || 0),
        },
        currentEditId.value,
      )
      ElMessage.success('更新模块成功')
    }
    dialogVisible.value = false
    await fetchDictGroups()
  } catch (error) {
    ElMessage.error(error?.message || (dialogMode.value === 'create' ? '新增模块失败' : '更新模块失败'))
  } finally {
    submitLoading.value = false
  }
}

onMounted(fetchDictGroups)
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

.header-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
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

.group-list {
  margin-top: 18px;
  min-height: 220px;
}

.group-card + .group-card {
  margin-top: 16px;
}

.group-header {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.group-title {
  font-size: 16px;
  font-weight: 700;
  color: rgba(15, 23, 42, 1);
}

.empty-state {
  padding: 40px 16px;
  border: 1px dashed rgba(203, 213, 225, 1);
  border-radius: 12px;
  text-align: center;
  color: rgba(100, 116, 139, 1);
}

.table-list {
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

  .header-actions,
  .row-actions {
    justify-content: flex-start;
  }
}
</style>
