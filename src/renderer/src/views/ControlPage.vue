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
          <div class="log-container">
            <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" />
            <div style="padding: 16px;">
              <CaptionLog v-if="current[0] === 'captionLog'" />  
              <SoftwareLog v-else />
            </div>
          </div>
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
import SoftwareLog from '@renderer/components/SoftwareLog.vue'
import { storeToRefs } from 'pinia'
import { useGeneralSettingStore } from '@renderer/stores/generalSetting'
import { ref, watch } from 'vue'
import { MenuProps } from 'ant-design-vue'
import { logMenu } from '@renderer/i18n'

const generalSettingStore = useGeneralSettingStore()
const { leftBarWidth, antdTheme, uiLanguage } = storeToRefs(generalSettingStore)

const current = ref<string[]>(['captionLog'])
const items = ref<MenuProps['items']>(logMenu[uiLanguage.value])

watch(uiLanguage, (val) => { 
  items.value = logMenu[val]
})
</script>

<style scoped>
.control-container {
  background-color: var(--control-background);
}

.caption-control {
  height: 100vh;
  border-right: 1px solid var(--tag-color);
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

.log-container {
  padding: 20px 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
