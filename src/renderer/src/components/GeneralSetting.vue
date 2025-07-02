<template>
  <a-card size="small" title="页面宽度">
    <template #extra>
      <a-button type="link" @click="showAbout = true">关于本项目</a-button>
    </template>
    <div>
      <a-input type="range" class="span-input" min="6" max="18" v-model:value="leftBarWidth" />
    </div>
  </a-card>

  <a-modal v-model:open="showAbout" title="关于本项目" :footer="null">
    <div class="about-modal-content">
      <h2 class="about-title">Auto Caption 项目</h2>
      <p class="about-desc">一个跨平台的实时字幕显示软件。</p>
      <a-divider />
      <div class="about-info">
        <p><b>作者：</b>HiMeditator</p>
        <p><b>版本：</b>v0.1.0</p>
        <p>
          <b>项目地址：</b>
          <a href="https://github.com/HiMeditator/auto-caption" target="_blank">
            GitHub | auto-caption
          </a>
        </p>
        <p>
          <b>用户手册：</b>
          <a
            href="https://github.com/HiMeditator/auto-caption/blob/main/assets/user-manual_zh.md"
            target="_blank"
          >
            GitHub | user-manual_zh.md
          </a>
        </p>
      </div>
      <div class="about-date">2026 年 6 月 26 日</div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useGeneralSettingStore } from '@renderer/stores/generalSetting'

const generalSettingStore = useGeneralSettingStore()
const { leftBarWidth } = storeToRefs(generalSettingStore)
const showAbout = ref(false)
</script>

<style scoped>
.span-input {
  width: 100px;
}
</style>
