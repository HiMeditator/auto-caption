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
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCaptionLogStore } from '@renderer/stores/captionLog'
import { useEngineControlStore } from '@renderer/stores/engineControl'
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
