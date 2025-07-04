import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { i18n } from '../i18n'
import type { UILanguage } from '../types'

import { engines, audioTypes } from '../i18n'
import { useEngineControlStore } from './engineControl'

export const useGeneralSettingStore = defineStore('generalSetting', () => {
  const uiLanguage = ref<UILanguage>('zh')
  const leftBarWidth = ref<number>(8)

  watch(uiLanguage, (newValue) => {
    i18n.global.locale.value = newValue
    useEngineControlStore().captionEngine = engines[newValue]
    useEngineControlStore().audioType = audioTypes[newValue]
    window.electron.ipcRenderer.send('control.uiLanguage.change', newValue)
  })

  watch(leftBarWidth, (newValue) => {
    window.electron.ipcRenderer.send('control.leftBarWidth.change', newValue)
  })

  window.electron.ipcRenderer.on('caption.uiLanguage.set', (_, args: UILanguage) => {
    uiLanguage.value = args
  })

  return {
    uiLanguage,
    leftBarWidth
  }
})
