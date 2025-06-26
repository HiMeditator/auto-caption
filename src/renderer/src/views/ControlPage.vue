<template>
  <div>
    <a-row>
      <a-col :span="controlSpan">
        <div class="caption-control">
          <a-card size="small" title="页面宽度">
            <template #extra>
              <a-button type="link" @click="showAbout = true">关于本项目</a-button>
            </template>
            <div>
              <a-input type="range" class="span-input" min="6" max="18" v-model:value="controlSpan" />
            </div>
          </a-card>
          <CaptionControl />
          <CaptionStyle />
        </div>
      </a-col>
      <a-col :span="24 - controlSpan">
        <div class="caption-data">
          <CaptionData />
        </div>
      </a-col>
    </a-row>
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
  </div>
</template>

<script setup lang="ts">
import CaptionStyle from '../components/CaptionStyle.vue'
import CaptionControl from '../components/CaptionControl.vue';
import CaptionData from '../components/CaptionData.vue'
import { ref } from 'vue'
const controlSpan = ref(8)
const showAbout = ref(false)
</script>

<style scoped>
.caption-control {
  height: 100vh;
  border-right: 1px solid #7774;
  padding: 20px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.caption-data {
  height: 100vh;
  padding: 20px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.span-input {
  width: 100px;
}

.about-modal-content {
  text-align: center;
  padding: 8px 0 0 0;
}

.about-title {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 0.2em;
}

.about-desc {
  color: #666;
  margin-bottom: 0.5em;
}

.about-info {
  text-align: left;
  display: inline-block;
  margin: 0 auto;
  font-size: 1em;
}

.about-date {
  margin-top: 1.5em;
  color: #aaa;
  font-size: 0.95em;
  text-align: right;
}
</style>