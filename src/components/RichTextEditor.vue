<template>
  <div class="rich-text-editor">
    <Toolbar
      class="rich-text-toolbar"
      :editor="editorRef"
      :defaultConfig="toolbarConfigComputed"
      :mode="mode"
    />

    <Editor
      class="rich-text-body"
      v-model="html"
      :defaultConfig="editorConfigComputed"
      :mode="mode"
      @onCreated="handleCreated"
      @onChange="handleChange"
      @onFocus="handleFocus"
      @onBlur="handleBlur"
    />
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css'

import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { uploadPostImage } from '@/api/forum.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  mode: {
    type: String,
    default: 'default',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '请输入内容…',
  },
  height: {
    type: [String, Number],
    default: 360,
  },
  toolbarConfig: {
    type: Object,
    default: () => ({}),
  },
  editorConfig: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur', 'created'])

const editorRef = shallowRef()
const html = computed({
  get() {
    return props.modelValue || ''
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

const toolbarConfigComputed = computed(() => props.toolbarConfig)

const editorConfigComputed = computed(() => {
  const heightValue = typeof props.height === 'number' ? `${props.height}px` : String(props.height)

  const externalMenuConf = props.editorConfig?.MENU_CONF || {}
  const externalUploadImageConf = externalMenuConf?.uploadImage

  const MENU_CONF = {
    ...externalMenuConf,
    uploadImage:
      externalUploadImageConf ||
      {
        customUpload: async (file, insertFn) => {
          const res = await uploadPostImage(file)

          const errno = typeof res?.errno === 'number' ? res.errno : 0
          if (errno !== 0) {
            throw new Error(res?.message || '图片上传失败')
          }

          const url = res?.data?.url
          if (!url || typeof url !== 'string') {
            throw new Error('图片上传失败')
          }

          insertFn(url)
        },
      },
  }

  return {
    placeholder: props.placeholder,
    readOnly: props.disabled,
    ...props.editorConfig,
    MENU_CONF,
    // 基础样式统一在组件内提供
    scroll: false,
    autoFocus: false,
    style: {
      ...(props.editorConfig?.style || {}),
      height: (props.editorConfig?.style || {}).height || heightValue,
      overflowY: (props.editorConfig?.style || {}).overflowY || 'auto',
    },
  }
})

function handleCreated(editor) {
  editorRef.value = editor
  emit('created', editor)
}

function handleChange(editor) {
  emit('change', { editor, html: editor.getHtml(), text: editor.getText() })
}

function handleFocus(editor) {
  emit('focus', editor)
}

function handleBlur(editor) {
  emit('blur', editor)
}

watch(
  () => props.disabled,
  (value) => {
    const editor = editorRef.value
    if (!editor) return

    if (value) {
      editor.disable()
    } else {
      editor.enable()
    }
  }
)

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor) editor.destroy()
})
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.rich-text-toolbar {
  border-bottom: 1px solid #e5e7eb;
}

.rich-text-body {
  padding: 0 12px;
}
</style>
