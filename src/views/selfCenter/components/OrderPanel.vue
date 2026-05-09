<template>
  <FeaturePanelBase
    icon="📦"
    title="订单管理"
    subtitle="查看课程、服务与商品相关订单。"
    description="后续可接入订单列表、支付状态、售后处理与详情查看。"
    :items="items"
  />
</template>

<script setup>
import FeaturePanelBase from './FeaturePanelBase.vue'

const items = [
  { label: '全部订单', value: '14 笔' },
  { label: '待支付', value: '1 笔' },
  { label: '已完成', value: '11 笔' },
  { label: '退款中', value: '2 笔' },
]
</script>
