<template>
  <el-dialog v-model="visible" title="免费发布闲置" width="560px" :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="物品分类" prop="category">
        <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
          <el-option label="母婴用品" value="baby" />
          <el-option label="童装童鞋" value="clothes" />
          <el-option label="玩具游乐" value="toy" />
          <el-option label="图书文具" value="book" />
          <el-option label="儿童家具" value="furniture" />
          <el-option label="安全出行" value="travel" />
          <el-option label="喂养用品" value="feed" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>

      <el-form-item label="物品名称" prop="name">
        <el-input v-model="form.name" placeholder="例如：婴儿推车可折叠" maxlength="30" show-word-limit />
      </el-form-item>

      <el-form-item label="成色" prop="condition">
        <el-select v-model="form.condition" placeholder="请选择成色" style="width: 100%">
          <el-option label="全新" value="全新" />
          <el-option label="9成新" value="9成新" />
          <el-option label="8成新" value="8成新" />
          <el-option label="7成新" value="7成新" />
          <el-option label="6成新" value="6成新" />
        </el-select>
      </el-form-item>

      <el-form-item label="价格(¥)" prop="price">
        <el-input v-model="form.price" placeholder="例如：99" />
      </el-form-item>

      <el-form-item label="描述" prop="desc">
        <el-input v-model="form.desc" type="textarea" :rows="3" placeholder="补充使用情况、配件、适用年龄等" maxlength="120" show-word-limit />
      </el-form-item>

      <el-form-item label="上传图片" prop="image">
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

      <el-form-item label="所在地区" prop="location">
        <el-input v-model="form.location" placeholder="例如：海淀区" maxlength="10" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="success" :loading="submitting" @click="submit">确认发布</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'submitted'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const formRef = ref(null)
const submitting = ref(false)

const fileList = ref([])

const form = ref({
  category: '',
  name: '',
  condition: '',
  price: '',
  desc: '',
  image: '',
  location: '',
})

const rules = {
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  name: [{ required: true, message: '请输入物品名称', trigger: 'blur' }],
  condition: [{ required: true, message: '请选择成色', trigger: 'change' }],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const num = Number(value)
        if (!value && value !== 0) return callback(new Error('请输入价格'))
        if (!Number.isFinite(num) || num <= 0) return callback(new Error('价格需为正数'))
        return callback()
      },
      trigger: 'blur',
    },
  ],
  desc: [{ required: true, message: '请填写描述', trigger: 'blur' }],
  image: [{ required: true, message: '请上传图片', trigger: 'change' }],
  location: [{ required: true, message: '请填写地区', trigger: 'blur' }],
}

watch(
  () => visible.value,
  (val) => {
    if (!val) {
      formRef.value?.resetFields?.()
      form.value.image = ''
      fileList.value = []
    }
  },
)

async function submit() {
  if (submitting.value) return

  const formEl = formRef.value
  if (!formEl) return

  try {
    submitting.value = true
    await formEl.validate()

    ElMessage.success('发布成功（待接入后端）')
    emit('submitted', { ...form.value })
    visible.value = false
  } catch (error) {
  } finally {
    submitting.value = false
  }
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
    form.value.image = await fileToDataUrl(raw)
    formRef.value?.validateField?.('image')
  } catch (error) {
    ElMessage.error('图片处理失败')
  }
}

function handleFileRemove() {
  form.value.image = ''
  fileList.value = []
}

function handleExceed() {
  ElMessage.warning('仅支持上传 1 张图片')
}
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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
