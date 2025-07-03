<template>
  <a-card size="small" :title="$t('general.title')">
    <div>
      <div class="input-item">
        <span class="input-label">{{ $t('general.uiLanguage') }}</span>
        <a-radio-group v-model:value="uiLanguage">
          <a-radio-button value="zh">中文</a-radio-button>
          <a-radio-button value="en">English</a-radio-button>
          <a-radio-button value="ja">日本語</a-radio-button>
        </a-radio-group>
      </div>
      <div class="input-item">
        <span class="input-label">{{ $t('general.barWidth') }}</span>
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
const { uiLanguage, leftBarWidth } = storeToRefs(generalSettingStore)
</script>

<style scoped>
@import url(../assets/input.css);

.span-input {
  width: 100px;
}
</style>
