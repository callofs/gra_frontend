<template>
  <FeaturePanelBase
    icon="✉"
    title="意见反馈"
    subtitle="提交产品建议、问题反馈与体验评价。"
    description="后续可接入反馈表单、处理进度、历史反馈记录与附件上传。"
    :items="items"
  />
</template>

<script setup>
import FeaturePanelBase from './FeaturePanelBase.vue'

const items = [
  { label: '已提交反馈', value: '5 条' },
  { label: '处理中', value: '1 条' },
  { label: '已回复', value: '4 条' },
  { label: '最近提交', value: '3 天前' },
]
</script>
