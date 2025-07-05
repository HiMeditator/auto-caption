<template>
  <div class="caption-stat">
    <a-row>
      <a-col :span="6">
        <a-statistic
          :title="$t('status.engine')"
          :value="(customized && customizedApp)?$t('status.customized'):engine"
        />
      </a-col>
      <a-col :span="6">
        <a-statistic
          :title="$t('status.status')"
          :value="engineEnabled?$t('status.started'):$t('status.stopped')"
        />
      </a-col>
      <a-col :span="6">
        <a-statistic :title="$t('status.logNumber')" :value="captionData.length" />
      </a-col>
      <a-col :span="6">
        <div class="about-tag">{{ $t('status.aboutProj') }}</div>
          <GithubOutlined class="proj-info" @click="showAbout = true"/>
      </a-col>
    </a-row>
  </div>

  <div class="caption-control">
    <a-button
      type="primary"
      class="control-button"
      @click="openCaptionWindow"
    >{{ $t('status.openCaption') }}</a-button>
    <a-button
      class="control-button"
      :disabled="engineEnabled"
      @click="startEngine"
    >{{ $t('status.startEngine') }}</a-button>
    <a-button
     danger class="control-button"
     :disabled="!engineEnabled"
     @click="stopEngine"
    >{{ $t('status.stopEngine') }}</a-button>
  </div>

  <a-modal v-model:open="showAbout" :title="$t('status.about.title')" :footer="null">
    <div class="about-modal-content">
      <h2 class="about-title">{{ $t('status.about.proj') }}</h2>
      <p class="about-desc">{{ $t('status.about.desc') }}</p>
      <a-divider />
      <div class="about-info">
        <p><b>{{ $t('status.about.version') }}</b><a-tag color="green">v0.1.0</a-tag></p>
        <p>
          <b>{{ $t('status.about.author') }}</b>
          <a
            href="https://github.com/HiMeditator"
            target="_blank"
          >
            <a-tag color="blue">HiMeditator</a-tag>
          </a>
        </p>
        <p>
          <b>{{ $t('status.about.projLink') }}</b>
          <a href="https://github.com/HiMeditator/auto-caption" target="_blank">
            <a-tag color="blue">GitHub | auto-caption</a-tag>
          </a>
        </p>
        <p>
          <b>{{ $t('status.about.manual') }}</b>
          <a
            href="https://github.com/HiMeditator/auto-caption/blob/main/assets/user-manual_zh.md"
            target="_blank"
          >
            <a-tag color="blue">GitHub | user-manual_zh.md</a-tag>
          </a>
        </p>
      </div>
      <div class="about-date">{{ $t('status.about.date') }}</div>
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
  color: var(--tag-color);
  margin-bottom: 16px;
}

.proj-info {
  display: inline-block;
  font-size: 24px;
  cursor: pointer;
  color: var(--icon-color);
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

.about-info b {
  margin-right: 1em;
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
