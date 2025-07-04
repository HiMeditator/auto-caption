<template>
  <router-view></router-view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { FullConfig } from './types'
import { useCaptionLogStore } from './stores/captionLog'
import { useCaptionStyleStore } from './stores/captionStyle'
import { useEngineControlStore } from './stores/engineControl'
import { useGeneralSettingStore } from './stores/generalSetting'

onMounted(() => {
  window.electron.ipcRenderer.invoke('both.window.mounted').then((data: FullConfig) => {
    console.log(data)
    useGeneralSettingStore().uiLanguage = data.uiLanguage
    useGeneralSettingStore().leftBarWidth = data.leftBarWidth
    useCaptionStyleStore().setStyles(data.styles)
    useEngineControlStore().setControls(data.controls)
    useCaptionLogStore().captionData = data.captionLog
  })
})
</script>
