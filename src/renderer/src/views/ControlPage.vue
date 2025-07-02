<template>
  <a-row>
    <a-col :span="leftBarWidth">
      <div class="caption-control">
        <GeneralSetting />
        <EngineControl />
        <CaptionStyle />
      </div>
    </a-col>
    <a-col :span="24 - leftBarWidth">
      <div class="caption-data">
        <EngineStatus />
        <CaptionLog />
      </div>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import GeneralSetting from '../components/GeneralSetting.vue'
import CaptionStyle from '../components/CaptionStyle.vue'
import EngineControl from '../components/EngineControl.vue'
import EngineStatus from '@renderer/components/EngineStatus.vue'
import CaptionLog from '../components/CaptionLog.vue'
import { storeToRefs } from 'pinia'
import { useGeneralSettingStore } from '@renderer/stores/generalSetting'

const generalSettingStore = useGeneralSettingStore()
const { leftBarWidth } = storeToRefs(generalSettingStore)
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
