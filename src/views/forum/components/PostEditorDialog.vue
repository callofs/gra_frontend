<template>
  <el-dialog
    :model-value="modelValue"
    title="发布帖子"
    width="860px"
    :close-on-click-modal="false"
    @close="handleClose"
    @update:model-value="handleVisibleChange"
  >
    <el-form label-width="90px" class="form">
      <el-form-item label="标题">
        <el-input v-model="form.title" placeholder="请输入标题" maxlength="60" show-word-limit />
      </el-form-item>

      <el-form-item label="板块">
        <el-select v-model="form.board" placeholder="请选择板块" style="width: 100%">
          <el-option v-for="b in boards" :key="b.key" :label="b.name" :value="b.key" />
        </el-select>
      </el-form-item>

      <el-form-item label="封面">
        <el-upload
          class="cover-uploader"
          :show-file-list="false"
          :auto-upload="false"
          accept="image/*"
          :on-change="handleCoverChange"
        >
          <div v-if="form.coverUrl" class="cover-preview">
            <img :src="form.coverUrl" alt="cover" />
            <div class="cover-mask">点击更换</div>
          </div>
          <div v-else class="cover-placeholder">点击上传封面</div>
        </el-upload>
      </el-form-item>

      <el-form-item label="标签">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="选择或输入标签"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="是否匿名">
        <el-radio-group v-model="form.isAnonymous">
          <el-radio :value="false">否</el-radio>
          <el-radio :value="true">是</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="内容">
        <RichTextEditor v-model="form.content" :height="360" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">发布</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import RichTextEditor from '@/components/RichTextEditor.vue'
import { getDictList } from '@/api/dict.js'
import { uploadPostImage } from '@/api/forum.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  initialValue: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const boards = ref([])
const boardsLoaded = ref(false)

const coverUploading = ref(false)

const form = reactive({
  title: '',
  board: '',
  coverUrl: '',
  tags: [],
  content: '',
  isAnonymous: false,
})

watch(
  () => props.modelValue,
  async (visible) => {
    if (!visible) return

    if (!boardsLoaded.value) {
      await fetchBoards()
    }

    form.title = props.initialValue?.title || ''
    form.board = props.initialValue?.board || ''
    form.coverUrl = props.initialValue?.coverUrl || ''
    form.tags = Array.isArray(props.initialValue?.tags) ? [...props.initialValue.tags] : []
    form.content = props.initialValue?.content || ''
    form.isAnonymous = !!props.initialValue?.isAnonymous
  },
  { immediate: true }
)

async function fetchBoards() {
  try {
    const res = await getDictList('forum')

    const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
    boards.value = list.map((item) => ({
      key: item.dictCode,
      name: item.dictName,
    }))
    boardsLoaded.value = true
  } catch (error) {
    ElMessage.error(error?.message || '获取板块失败')
  }
}

function handleVisibleChange(value) {
  emit('update:modelValue', value)
}

function handleClose() {
  emit('update:modelValue', false)
}

function handleCoverChange(uploadFile) {
  const raw = uploadFile?.raw
  if (!raw) return

  if (!raw.type || !raw.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    return
  }

  uploadCover(raw)
}

async function uploadCover(file) {
  if (coverUploading.value) return

  coverUploading.value = true
  try {
    const res = await uploadPostImage(file)
    const errno = typeof res?.errno === 'number' ? res.errno : 0
    if (errno !== 0) {
      throw new Error(res?.message || '封面上传失败')
    }

    const url = res?.data?.url
    if (!url || typeof url !== 'string') {
      throw new Error('封面上传失败')
    }

    form.coverUrl = url
  } catch (error) {
    ElMessage.error(error?.message || '封面上传失败')
  } finally {
    coverUploading.value = false
  }
}

function handleSubmit() {
  if (!String(form.title || '').trim()) {
    ElMessage.warning('请填写标题')
    return
  }

  if (!String(form.board || '').trim()) {
    ElMessage.warning('请选择板块')
    return
  }

  if (!String(form.content || '').trim()) {
    ElMessage.warning('请填写内容')
    return
  }

  emit('submit', {
    title: String(form.title || '').trim(),
    board: String(form.board || '').trim(),
    coverUrl: form.coverUrl,
    tags: Array.isArray(form.tags) ? form.tags : [],
    content: form.content,
    isAnonymous: !!form.isAnonymous,
  })
}
</script>

<style scoped>
.form {
  padding-top: 8px;
}

.cover-uploader {
  width: 100%;
}

.cover-placeholder {
  width: 240px;
  height: 135px;
  border: 1px dashed #dcdfe6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  background: #fafafa;
}

.cover-preview {
  width: 240px;
  height: 135px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.cover-preview:hover .cover-mask {
  opacity: 1;
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
