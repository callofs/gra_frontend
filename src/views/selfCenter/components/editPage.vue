<template>
  <el-dialog
    :model-value="modelValue"
    title="编辑个人资料"
    width="640px"
    destroy-on-close
    @close="handleClose"
  >
    <el-form label-position="top" class="edit-form">
      <el-form-item label="昵称">
        <el-input v-model.trim="form.name" placeholder="请输入昵称" clearable />
      </el-form-item>

      <el-form-item label="手机号">
        <el-input v-model.trim="form.phone" placeholder="请输入手机号" clearable />
      </el-form-item>

      <el-form-item label="邮箱">
        <el-input v-model.trim="form.email" placeholder="请输入邮箱地址" clearable />
      </el-form-item>

      <el-form-item label="所在城市">
        <el-input v-model.trim="form.location" placeholder="请输入所在城市" clearable />
      </el-form-item>

      <el-form-item label="个性签名">
        <el-input
          v-model.trim="form.bio"
          type="textarea"
          :rows="5"
          resize="none"
          placeholder="介绍一下你自己或你的育儿理念"
        />
      </el-form-item>

      <el-form-item v-if="isExpert" label="认证材料">
        <div class="credential-box">
          <div class="credential-meta">
            <div class="credential-name">{{ form.credentialName || '未上传认证材料' }}</div>
            <div class="credential-tip">支持上传 `.doc`、`.docx`、`.pdf` 格式文件</div>
          </div>

          <div class="credential-actions">
            <el-upload
              :show-file-list="false"
              :auto-upload="false"
              accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
              :on-change="handleCredentialChange"
            >
              <el-button type="default">选择文件</el-button>
            </el-upload>

            <el-button v-if="form.credentialUrl" link type="primary" @click="downloadCredential">
              下载当前材料
            </el-button>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  initialData: {
    type: Object,
    default: () => ({}),
  },
  isExpert: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const uploadFileList = ref([])

const form = reactive({
  name: '',
  username: '',
  phone: '',
  email: '',
  location: '',
  stage: '',
  bio: '',
  avatar: '',
  role: '',
  credentialName: '',
  credentialUrl: '',
})

function syncForm(data = {}) {
  form.name = data.name || ''
  form.username = data.username || ''
  form.phone = data.phone || ''
  form.email = data.email || ''
  form.location = data.location || ''
  form.stage = data.stage || ''
  form.bio = data.bio || ''
  form.avatar = data.avatar || ''
  form.role = data.role || ''
  form.credentialName = data.credentialName || ''
  form.credentialUrl = data.credentialUrl || ''
}

watch(
  () => props.initialData,
  (value) => {
    syncForm(value)
  },
  { immediate: true, deep: true }
)

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      syncForm(props.initialData)
    }
  }
)

function handleClose() {
  emit('update:modelValue', false)
}

function handleCredentialChange(uploadFile) {
  const file = uploadFile?.raw
  if (!file) return

  const fileName = String(file.name || '').toLowerCase()
  const isValid = fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx')

  if (!isValid) {
    ElMessage.error('认证材料仅支持 doc、docx、pdf 格式')
    uploadFileList.value = []
    return
  }

  form.credentialName = file.name
  form.credentialUrl = URL.createObjectURL(file)
  uploadFileList.value = [uploadFile]
}

function downloadCredential() {
  if (!form.credentialUrl) return

  window.open(form.credentialUrl, '_blank', 'noopener')
}

function handleSave() {
  emit('save', {
    name: form.name,
    username: form.username,
    phone: form.phone,
    email: form.email,
    location: form.location,
    stage: form.stage,
    bio: form.bio,
    avatar: form.avatar,
    role: form.role,
    credentialName: form.credentialName,
    credentialUrl: form.credentialUrl,
  })
  emit('update:modelValue', false)
}
</script>

<style scoped>
.edit-form {
  padding-top: 8px;
}

.credential-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
}

.credential-meta {
  min-width: 0;
}

.credential-name {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  word-break: break-all;
}

.credential-tip {
  margin-top: 6px;
  font-size: 12px;
  color: #64748b;
}

.credential-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .credential-box {
    flex-direction: column;
    align-items: flex-start;
  }

  .dialog-footer {
    width: 100%;
    flex-direction: column;
  }
}
</style>
