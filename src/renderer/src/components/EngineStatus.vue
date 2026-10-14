<template>
  <div class="caption-stat">
    <a-row>
      <a-col :span="5">
        <a-statistic
          :title="$t('status.engine')"
          :value="customized?$t('status.customized'):engine"
        />
      </a-col>
      <a-popover :title="$t('status.engineStatus')">
        <template #content>
          <a-row class="engine-status">
            <a-col :flex="1" :title="$t('status.pid')" style="cursor:pointer;">
              <div class="engine-status-title">pid</div>
              <div>{{ pid }}</div>
            </a-col>
            <a-col :flex="1" :title="$t('status.ppid')" style="cursor:pointer;">
              <div class="engine-status-title">ppid</div>
              <div>{{ ppid }}</div>
            </a-col>
            <a-col :flex="1" :title="$t('status.port')" style="cursor:pointer;">
              <div class="engine-status-title">port</div>
              <div>{{ port }}</div>
            </a-col>
            <a-col :flex="1" :title="$t('status.cpu')" style="cursor:pointer;">
              <div class="engine-status-title">cpu</div>
              <div>{{ cpu.toFixed(1) }}%</div>
            </a-col>
            <a-col :flex="1" :title="$t('status.mem')" style="cursor:pointer;">
              <div class="engine-status-title">mem</div>
              <div>{{ (mem/1024/1024).toFixed(2) }}MB</div>
            </a-col>
            <a-col :flex="1" :title="$t('status.elapsed')" style="cursor:pointer;">
              <div class="engine-status-title">elapsed</div>
              <div>{{ (elapsed/1000).toFixed(0) }}s</div>
            </a-col>
          </a-row>
        </template>
        <a-col :span="5" @mouseenter="getEngineInfo" style="cursor: pointer;">
          <a-statistic
            :title="$t('status.status')"
            :value="engineEnabled?$t('status.started'):$t('status.stopped')"
          >
            <template #suffix v-if="engineEnabled">
              <InfoCircleOutlined style="font-size:18px;color:#1677ff"/>
            </template>
          </a-statistic>
        </a-col>
      </a-popover>
      <a-col :span="5">
        <a-statistic :title="$t('status.logNumber')" :value="captionData.length" />
      </a-col>
      <a-col :span="5">
        <a-statistic :title="$t('status.logNumber2')" :value="softwareLogs.length" />
      </a-col>
      <a-col :span="4">
        <div class="about-tag">{{ $t('status.aboutProj') }}</div>
        <button
          type="button"
          class="proj-info"
          :aria-label="$t('status.aboutProj')"
          @click="showAbout = true"
        ><GithubOutlined /></button>
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
      v-if="!isStarting"
      class="control-button"
      :loading="pending && !engineEnabled"
      :disabled="pending || engineEnabled"
      @click="startEngine"
    >{{ $t('status.startEngine') }}</a-button>
    <a-popconfirm
      v-if="isStarting"
      :title="$t('status.forceKillConfirm')"
      :ok-text="$t('status.confirm')"
      :cancel-text="$t('status.cancel')"
      @confirm="forceKillEngine"
    >
      <a-button
        danger
        class="control-button"
        type="primary"
        :icon="h(LoadingOutlined)"
      >{{ $t('status.forceKillStarting') }}</a-button>
    </a-popconfirm>
    <a-button
     danger class="control-button"
     :loading="pending && engineEnabled"
     :disabled="pending || !engineEnabled"
     @click="stopEngine"
    >{{ $t('status.stopEngine') }}</a-button>
  </div>

  <AboutProject v-model:open="showAbout" />
</template>

<script setup lang="ts">
import { EngineInfo } from '@renderer/types'
import { ref, watch, h } from 'vue'
import { storeToRefs } from 'pinia'
import { useCaptionLogStore } from '@renderer/stores/captionLog'
import { useSoftwareLogStore } from '@renderer/stores/softwareLog'
import { useEngineControlStore } from '@renderer/stores/engineControl'
import { GithubOutlined, InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import AboutProject from './AboutProject.vue'

const showAbout = ref(false)
const pending = ref(false)
const isStarting = ref(false)

const captionLog = useCaptionLogStore()
const { captionData } = storeToRefs(captionLog)
const softwareLog = useSoftwareLogStore()
const { softwareLogs } = storeToRefs(softwareLog)
const engineControl = useEngineControlStore()
const { engineEnabled, engine, customized, errorSignal } = storeToRefs(engineControl)

const pid = ref(0)
const ppid = ref(0)
const port = ref(0)
const cpu = ref(0)
const mem = ref(0)
const elapsed = ref(0)

function openCaptionWindow(): void {
  window.electron.ipcRenderer.send('control.captionWindow.activate')
}

function startEngine(): void {
  pending.value = true
  isStarting.value = true
  if(engineControl.engine === 'vosk' && engineControl.voskModelPath.trim() === '') {
    engineControl.emptyModelPathErr()
    pending.value = false
    isStarting.value = false
    return
  }
  if(engineControl.engine === 'sosv' && engineControl.sosvModelPath.trim() === '') {
    engineControl.emptyModelPathErr()
    pending.value = false
    isStarting.value = false
    return
  }
  window.electron.ipcRenderer.send('control.engine.start')
}

function stopEngine(): void {
  pending.value = true
  window.electron.ipcRenderer.send('control.engine.stop')
}

function forceKillEngine(): void {
  pending.value = true
  isStarting.value = false
  window.electron.ipcRenderer.send('control.engine.forceKill')
}

function getEngineInfo(): void {
  window.electron.ipcRenderer.invoke('control.engine.info').then((data: EngineInfo) => {
    pid.value = data.pid
    ppid.value = data.ppid
    port.value = data.port
    cpu.value = data.cpu
    mem.value = data.mem
    elapsed.value = data.elapsed
  })
}

watch(engineEnabled, (enabled) => {
  pending.value = false
  if (enabled) {
    isStarting.value = false
  }
})

watch(errorSignal, () => {
  pending.value = false
  isStarting.value = false
  errorSignal.value = false
})
</script>

<style scoped>
.engine-status {
  width: max(420px, 36vw);
  display: flex;
  align-items: center;
  padding: 5px 10px;
}

.engine-status-title {
  font-size: 12px;
  color: var(--tag-color);
}

.about-tag {
  color: var(--tag-color);
  margin-bottom: 16px;
}

.proj-info {
  display: inline-block;
  padding: 0;
  border: 0;
  background: transparent;
  font-size: 24px;
  cursor: pointer;
  color: var(--icon-color);
}

.proj-info:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 4px;
  border-radius: 4px;
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
