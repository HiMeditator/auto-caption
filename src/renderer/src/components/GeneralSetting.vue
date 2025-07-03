<template>
  <a-card size="small" title="通用设置">
    <div>
      <div class="input-item">
        <span class="input-label">边栏宽度</span>
        <a-input
          type="range" class="span-input"
          min="6" max="12" v-model:value="leftBarWidth"
        />
        <div class="input-item-value">{{ (leftBarWidth * 100 / 24).toFixed(0) }}%</div>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useGeneralSettingStore } from '@renderer/stores/generalSetting'

const generalSettingStore = useGeneralSettingStore()
const { leftBarWidth } = storeToRefs(generalSettingStore)
</script>

<style scoped>
@import url(../assets/input.css);

.span-input {
  width: 100px;
}
</style>
