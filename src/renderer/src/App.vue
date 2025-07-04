<template>
  <router-view></router-view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FullConfig } from './types'
import { useCaptionLogStore } from './stores/captionLog'
import { useCaptionStyleStore } from './stores/captionStyle'
import { useEngineControlStore } from './stores/engineControl'
import { useGeneralSettingStore } from './stores/generalSetting'

const router = useRouter()

onMounted(() => {
  console.log('Current route:', router.currentRoute.value.fullPath)
  window.electron.ipcRenderer.invoke('both.window.mounted').then((data: FullConfig) => {
    useGeneralSettingStore().uiLanguage = data.uiLanguage
    useGeneralSettingStore().uiTheme = data.uiTheme
    useGeneralSettingStore().leftBarWidth = data.leftBarWidth
    useCaptionStyleStore().setStyles(data.styles)
    useEngineControlStore().setControls(data.controls)
    useCaptionLogStore().captionData = data.captionLog
  })
})
</script>
