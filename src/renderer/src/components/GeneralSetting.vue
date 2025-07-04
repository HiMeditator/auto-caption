<template>
  <a-card size="small" :title="$t('general.title')">
    <template #extra>
      <a-popover>
        <template #content>
          <p class="general-note">{{ $t('general.note') }}</p>
        </template>
        <a><InfoCircleOutlined /></a>
      </a-popover>
    </template>

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
        <span class="input-label">{{ $t('general.theme') }}</span>
        <a-radio-group v-model:value="uiTheme">
          <a-radio-button value="system">{{ $t('general.system') }}</a-radio-button>
          <a-radio-button value="light">{{ $t('general.light') }}</a-radio-button>
          <a-radio-button value="dark">{{ $t('general.dark') }}</a-radio-button>
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
import { InfoCircleOutlined } from '@ant-design/icons-vue';

const generalSettingStore = useGeneralSettingStore()
const { uiLanguage, uiTheme, leftBarWidth } = storeToRefs(generalSettingStore)
</script>

<style scoped>
@import url(../assets/input.css);

.span-input {
  width: 100px;
}

.general-note {
  padding: 10px 10px 0;
  max-width: min(36vw, 400px);
}
</style>
