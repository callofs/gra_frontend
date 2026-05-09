<template>
  <FeaturePanelBase
    icon="💳"
    title="钱包余额"
    subtitle="查看余额、充值与消费记录。"
    description="后续可接入余额明细、充值入口、优惠券与提现功能。"
    :items="items"
  />
</template>

<script setup>
import FeaturePanelBase from './FeaturePanelBase.vue'

const items = [
  { label: '当前余额', value: '¥268.00' },
  { label: '本月支出', value: '¥99.00' },
  { label: '优惠券', value: '4 张' },
  { label: '积分', value: '860' },
]
</script>
