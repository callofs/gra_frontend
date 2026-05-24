<template>
  <el-dialog v-model="visible" title="免费发布闲置" width="560px" :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="物品分类" prop="goodsTypeCode">
        <el-select v-model="form.goodsTypeCode" placeholder="请选择分类" style="width: 100%">
          <el-option v-for="item in categoryOptions" :key="item.key" :label="item.name" :value="item.key" />
        </el-select>
      </el-form-item>

      <el-form-item label="发布标题" prop="title">
        <el-input v-model="form.title" placeholder="例如：九成新婴儿推车转让" maxlength="40" show-word-limit />
      </el-form-item>

      <el-form-item label="物品名称" prop="name">
        <el-input v-model="form.name" placeholder="例如：婴儿推车可折叠" maxlength="30" show-word-limit />
      </el-form-item>

      <el-form-item label="成色" prop="oldDegree">
        <el-select v-model="form.oldDegree" placeholder="请选择成色" style="width: 100%">
          <el-option label="全新" value="全新" />
          <el-option label="9成新" value="9成新" />
          <el-option label="8成新" value="8成新" />
          <el-option label="7成新" value="7成新" />
          <el-option label="6成新" value="6成新" />
        </el-select>
      </el-form-item>

      <el-form-item label="适龄范围" prop="fitAge">
        <el-input v-model="form.fitAge" placeholder="例如：0-3岁" maxlength="20" />
      </el-form-item>

      <el-form-item label="尺码规格" prop="size">
        <el-input v-model="form.size" placeholder="例如：110cm / 40*30cm" maxlength="30" />
      </el-form-item>

      <el-form-item label="适用季节" prop="season">
        <el-input v-model="form.season" placeholder="例如：四季通用 / 冬季" maxlength="20" />
      </el-form-item>

      <el-form-item label="材质" prop="material">
        <el-input v-model="form.material" placeholder="例如：棉质 / 塑料" maxlength="30" />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="补充使用情况、配件、适用年龄等" maxlength="200" show-word-limit />
      </el-form-item>

      <el-form-item label="上传图片" prop="coverImages">
        <el-upload
          class="uploader"
          action="#"
          :auto-upload="false"
          :limit="2"
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

      <el-form-item label="取货方式" prop="pickUpType">
        <el-select v-model="form.pickUpType" placeholder="请选择取货方式" style="width: 100%">
          <el-option label="自提" :value="1" />
          <el-option label="邮寄" :value="2" />
          <el-option label="均可" :value="3" />
        </el-select>
      </el-form-item>

      <el-form-item label="所在地区" prop="address">
        <el-input v-model="form.address" placeholder="例如：海淀区" maxlength="30" />
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
  categories: {
    type: Array,
    default: () => [],
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
const imageFile = ref(null)

const categoryOptions = computed(() => props.categories.filter((item) => item?.key && item.key !== 'all'))

const form = ref({
  goodsTypeCode: '',
  title: '',
  name: '',
  oldDegree: '',
  fitAge: '',
  size: '',
  season: '',
  material: '',
  description: '',
  coverImages: '',
  pickUpType: 1,
  address: '',
})

const rules = {
  goodsTypeCode: [{ required: true, message: '请选择分类', trigger: 'change' }],
  title: [{ required: true, message: '请输入发布标题', trigger: 'blur' }],
  name: [{ required: true, message: '请输入物品名称', trigger: 'blur' }],
  oldDegree: [{ required: true, message: '请选择成色', trigger: 'change' }],
  description: [{ required: true, message: '请填写描述', trigger: 'blur' }],
  coverImages: [{ required: true, message: '请上传图片', trigger: 'change' }],
  address: [{ required: true, message: '请填写地区', trigger: 'blur' }],
}

watch(
  () => visible.value,
  (val) => {
    if (!val) {
      formRef.value?.resetFields?.()
      form.value.coverImages = ''
      form.value.pickUpType = 1
      fileList.value = []
      imageFile.value = null
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

    emit('submitted', {
      ...form.value,
      imageFile: imageFile.value,
    })
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
    imageFile.value = raw
    form.value.coverImages = await fileToDataUrl(raw)
    formRef.value?.validateField?.('coverImages')
  } catch (error) {
    ElMessage.error('图片处理失败')
  }
}

function handleFileRemove() {
  form.value.coverImages = ''
  fileList.value = []
  imageFile.value = null
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
