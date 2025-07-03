<template>
  <div class="caption-stat">
    <a-row>
      <a-col :span="6">
        <a-statistic title="字幕引擎" :value="(customized && customizedApp)?'自定义':engine" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="字幕引擎状态" :value="engineEnabled?'已启动':'未启动'" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="已记录字幕" :value="captionData.length" />
      </a-col>
      <a-col :span="6">
        <div class="about-tag">关于本项目</div>
          <GithubOutlined class="proj-info" @click="showAbout = true"/>
      </a-col>
    </a-row>
  </div>

  <div class="caption-control">
    <a-button
      type="primary"
      class="control-button"
      @click="openCaptionWindow"
    >打开字幕窗口</a-button>
    <a-button
      class="control-button"
      @click="startEngine"
    >启动字幕引擎</a-button>
    <a-button
     danger class="control-button"
     @click="stopEngine"
    >关闭字幕引擎</a-button>
  </div>

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
import { useCaptionLogStore } from '@renderer/stores/captionLog'
import { useEngineControlStore } from '@renderer/stores/engineControl'
import { GithubOutlined } from '@ant-design/icons-vue';

const showAbout = ref(false)

const captionLog = useCaptionLogStore()
const { captionData } = storeToRefs(captionLog)
const engineControl = useEngineControlStore()
const { engineEnabled, engine, customized, customizedApp } = storeToRefs(engineControl)

function openCaptionWindow() {
  window.electron.ipcRenderer.send('control.captionWindow.activate')
}

function startEngine() {
  window.electron.ipcRenderer.send('control.engine.start')
}

function stopEngine() {
  window.electron.ipcRenderer.send('control.engine.stop')
}
</script>

<style scoped>
.about-tag {
  color: rgba(0,0,0,0.45);
  margin-bottom: 16px;
}

.proj-info {
  display: inline-block;
  font-size: 24px;
  cursor: pointer;
  color: #1f2328;
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

.caption-control {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 30px;
}

.control-button {
  height: 40px;
  margin: 20px;
  font-size: 16px;
}
</style>
