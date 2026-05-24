<template>
  <el-dialog
    title="发布讲座"
    v-model="visible"
    width="500px"
    :before-close="handleClose"
  >
    <el-form
      :model="form"
      label-width="100px"
      class="publish-form"
    >
      <el-form-item label="讲座标题" prop="title">
        <el-input
          v-model="form.title"
          placeholder="请输入讲座标题"
          :maxlength="100"
        />
      </el-form-item>

      <el-form-item label="讲座描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          :maxlength="500"
          placeholder="请输入讲座描述"
        />
      </el-form-item>

      <el-form-item label="讲座时间" prop="lectureTime">
        <el-date-picker
          v-model="form.lectureTime"
          type="datetime"
          placeholder="选择讲座时间"
          :disabled-date="disabledDate"
        />
      </el-form-item>

      <el-form-item label="讲座地点" prop="location">
        <el-input
          v-model="form.location"
          placeholder="请输入讲座地点"
          :maxlength="100"
        />
      </el-form-item>

      <el-form-item label="最大人数" prop="maxSignUp">
        <el-input-number
          v-model="form.maxSignUp"
          :min="1"
          :max="1000"
          placeholder="请输入最大参与人数"
        />
      </el-form-item>

      <el-form-item label="封面图片" prop="cover">
        <el-upload
          class="uploader"
          action="#"
          :auto-upload="false"
          :limit="1"
          :file-list="fileList"
          list-type="picture-card"
          accept="image/*"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :on-exceed="handleExceed"
        >
          <span class="upload-text">+ 上传</span>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">发布讲座</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = ref(false)

const form = reactive({
  title: '',
  description: '',
  lectureTime: '',
  location: '',
  maxSignUp: 100,
  cover: ''
})

const fileList = ref([])
const imageFile = ref(null)

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    resetForm()
  }
})

function resetForm() {
  form.title = ''
  form.description = ''
  form.lectureTime = ''
  form.location = ''
  form.maxSignUp = 100
  form.cover = ''
  fileList.value = []
  imageFile.value = null
}

function handleClose() {
  emit('update:modelValue', false)
}

function disabledDate(time) {
  return time.getTime() < Date.now() - 8.64e7
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('读取图片失败'))
    reader.readAsDataURL(file)
  })
}

async function handleFileChange(uploadFile, uploadFiles) {
  const raw = uploadFile?.raw
  if (!raw) return

  try {
    fileList.value = uploadFiles.slice(-1)
    imageFile.value = raw
    form.cover = await fileToDataUrl(raw)
  } catch (error) {
    ElMessage.error('图片处理失败')
  }
}

function handleFileRemove() {
  form.cover = ''
  fileList.value = []
  imageFile.value = null
}

function handleExceed() {
  ElMessage.warning('仅支持上传 1 张图片')
}

function validateForm() {
  if (!form.title.trim()) {
    ElMessage.error('请输入讲座标题')
    return false
  }
  if (!form.description.trim()) {
    ElMessage.error('请输入讲座描述')
    return false
  }
  if (!form.lectureTime) {
    ElMessage.error('请选择讲座时间')
    return false
  }
  if (!form.location.trim()) {
    ElMessage.error('请输入讲座地点')
    return false
  }
  if (!form.maxSignUp || form.maxSignUp < 1) {
    ElMessage.error('请输入有效人数')
    return false
  }
  return true
}

async function handleSubmit() {
  if (!validateForm()) return

  const submitData = {
    title: form.title,
    description: form.description,
    lectureTime: new Date(form.lectureTime).toISOString(),
    location: form.location,
    maxSignUp: form.maxSignUp,
    imageFile: imageFile.value,
  }

  emit('submit', submitData)
}
</script>

<style scoped>
.publish-form {
  padding: 16px 0;
}

.uploader :deep(.el-upload) {
  width: 104px;
  height: 104px;
}

.upload-text {
  color: rgba(100, 116, 139, 1);
  font-size: 14px;
}
</style>
