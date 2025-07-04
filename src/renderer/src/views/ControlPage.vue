<template>
  <a-config-provider :theme="antdTheme">
    <a-row class="control-container">
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
  </a-config-provider>
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
const { leftBarWidth, antdTheme } = storeToRefs(generalSettingStore)
</script>

<style scoped>
.control-container {
  background-color: var(--control-background);
}


.caption-control {
  height: 100vh;
  border-right: 1px solid #7774;
  padding: 20px;
  overflow-y: auto;
}

.caption-data {
  height: 100vh;
  padding: 20px;
  overflow-y: auto;
}

.caption-control::-webkit-scrollbar,
.caption-data::-webkit-scrollbar {
  display: none;
}
</style>
