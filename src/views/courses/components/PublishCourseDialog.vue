<template>
  <el-dialog
    title="创建课程"
    v-model="visible"
    width="520px"
    :before-close="handleClose"
  >
    <el-form label-width="96px" class="publish-form">
      <el-form-item label="课程标题">
        <el-input v-model="form.title" maxlength="60" placeholder="请输入课程标题" />
      </el-form-item>

      <el-form-item label="封面图片" prop="coverUrl">
        <el-upload
          class="uploader"
          action="#"
          :auto-upload="false"
          :limit="1"
          :file-list="coverFileList"
          list-type="picture-card"
          accept="image/*"
          :on-change="handleCoverChange"
          :on-remove="handleCoverRemove"
          :on-exceed="handleCoverExceed"
        >
          <span class="upload-text">+ 上传</span>
        </el-upload>
      </el-form-item>

      <el-form-item label="课程简介">
        <el-input
          v-model="form.courseDesc"
          type="textarea"
          :rows="3"
          maxlength="300"
          placeholder="请输入课程简介"
        />
      </el-form-item>

      <el-form-item label="课程视频">
        <div class="video-upload-field">
          <el-button type="primary" :loading="uploading" @click="triggerVideoSelect">上传视频</el-button>
          <input
            ref="fileInput"
            class="video-file-input"
            type="file"
            accept=".mp4,.mov,.avi,.mkv,.flv,.wmv"
            @change="handleVideoFileChange"
          />
          <div class="upload-hint">
            {{ videoFileName ? `已上传：${videoFileName}` : '支持 MP4/MOV/AVI/MKV/FLV/WMV，上传后自动填入 ObjectKey' }}
          </div>
        </div>
      </el-form-item>

      <el-form-item label="课程时长">
        <div class="duration-field">
          <el-input-number v-model="form.durationMinutes" :min="1" :max="600" />
          <span class="duration-hint">分钟</span>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">提交审核</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadCourse, uploadCoverImg, lectureViewImages } from '@/api/course'

const props = defineProps({
  modelValue: Boolean,
  submitting: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = ref(false)

const form = reactive({
  title: '',
  coverUrl: '',
  courseDesc: '',
  videoObjectKey: '',
  durationMinutes: 60
})

const uploading = ref(false)
const videoFileName = ref('')
const fileInput = ref(null)
const coverFileList = ref([])
const coverUploading = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val) {
      resetForm()
    }
  }
)

function handleClose() {
  emit('update:modelValue', false)
}

function resetForm() {
  form.title = ''
  form.coverUrl = ''
  form.courseDesc = ''
  form.videoObjectKey = ''
  form.durationMinutes = 60
  videoFileName.value = ''
  coverFileList.value = []
  coverUploading.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function triggerVideoSelect() {
  fileInput.value?.click()
}

function handleVideoFileChange(event) {
  const file = event?.target?.files?.[0]
  if (!file) return
  event.target.value = ''
  uploadVideo(file)
}

async function uploadVideo(file) {
  const allowedExtensions = ['mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv']
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  if (!allowedExtensions.includes(extension)) {
    ElMessage.warning('请上传支持格式的视频文件')
    return
  }

  uploading.value = true
  try {
    const res = await uploadCourse(file)
    const objectKey = res?.data?.objectKey || res?.objectKey || res?.data?.key || res?.data || ''
    if (!objectKey) {
      throw new Error('上传失败，未返回 ObjectKey')
    }
    form.videoObjectKey = objectKey
    videoFileName.value = file.name
    ElMessage.success('视频上传成功，已填入 ObjectKey')
  } catch (error) {
    ElMessage.error(error?.message || '视频上传失败')
  } finally {
    uploading.value = false
  }
}

async function handleCoverChange(uploadFile, uploadFiles) {
  const raw = uploadFile?.raw
  if (!raw) return
  coverFileList.value = uploadFiles.slice(-1)
  coverUploading.value = true
  try {
    const uploadRes = await uploadCoverImg(raw)
    const objectKey = uploadRes?.data?.objectKey || uploadRes?.objectKey || uploadRes?.data?.key || uploadRes?.data || ''
    if (!objectKey) {
      throw new Error('封面上传失败，未返回 ObjectKey')
    }
    form.coverUrl = objectKey
    // const viewRes = await lectureViewImages(objectKey)
    // const previewUrl =
    //   typeof viewRes === 'string'
    //     ? viewRes
    //     : viewRes?.data?.url || viewRes?.url || viewRes?.data || ''
    // if (previewUrl) {
    //   coverFileList.value = [
    //     {
    //       name: raw.name,
    //       url: previewUrl,
    //     },
    //   ]
    // }
  } catch (error) {
    ElMessage.error(error?.message || '封面处理失败，请重新上传')
    coverFileList.value = []
    form.coverUrl = ''
  } finally {
    coverUploading.value = false
  }
}

function handleCoverRemove() {
  form.coverUrl = ''
  coverFileList.value = []
}

function handleCoverExceed() {
  ElMessage.warning('仅支持上传 1 张封面图片')
}

function validateForm() {
  if (!form.title.trim()) {
    ElMessage.warning('请输入课程标题')
    return false
  }
  if (!form.videoObjectKey.trim()) {
    ElMessage.warning('请上传课程视频')
    return false
  }
  if (!form.durationMinutes || Number(form.durationMinutes) < 1) {
    ElMessage.warning('请输入有效的时长')
    return false
  }
  return true
}

function handleSubmit() {
  if (!validateForm()) return

  emit('submit', {
    title: form.title.trim(),
    coverUrl: form.coverUrl.trim(),
    courseDesc: form.courseDesc.trim(),
    videoObjectKey: form.videoObjectKey,
    durationMinutes: Math.round(Number(form.durationMinutes) || 60)
  })
}
</script>

<style scoped>
.duration-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.duration-hint {
  color: rgba(100, 116, 139, 1);
  font-size: 13px;
}

.video-upload-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.video-input-row {
  display: flex;
  gap: 12px;
}

.video-input-row .el-input {
  flex: 1;
}

.video-file-input {
  display: none;
}

.upload-hint {
  font-size: 12px;
  color: rgba(144, 147, 153, 1);
}

.publish-form {
  padding: 16px 0;
}
</style>
