import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { i18n } from '../i18n'
import type { UILanguage, UITheme } from '../types'

import { engines, audioTypes, antDesignTheme, breakOptions  } from '../i18n'
import { useEngineControlStore } from './engineControl'
import { useCaptionStyleStore } from './captionStyle'

export const useGeneralSettingStore = defineStore('generalSetting', () => {
  const uiLanguage = ref<UILanguage>('zh')
  const uiTheme = ref<UITheme>('system')
  const leftBarWidth = ref<number>(8)

  const antdTheme = ref<Object>(antDesignTheme['light'])

  window.electron.ipcRenderer.invoke('control.nativeTheme.get').then((theme) => {
    if(theme === 'light') setLightTheme()
    else if(theme === 'dark') setDarkTheme()
  })

  watch(uiLanguage, (newValue) => {
    i18n.global.locale.value = newValue
    useEngineControlStore().captionEngine = engines[newValue]
    useEngineControlStore().audioType = audioTypes[newValue]
    useCaptionStyleStore().iBreakOptions = breakOptions[newValue]
    window.electron.ipcRenderer.send('control.uiLanguage.change', newValue)
  })

  watch(uiTheme, (newValue) => {
    window.electron.ipcRenderer.send('control.uiTheme.change', newValue)
    if(newValue === 'system'){
      window.electron.ipcRenderer.invoke('control.nativeTheme.get').then((theme) => {
        if(theme === 'light') setLightTheme()
        else if(theme === 'dark') setDarkTheme()
      })
    }
    else if(newValue === 'light') setLightTheme()
    else if(newValue === 'dark') setDarkTheme()
  })

  watch(leftBarWidth, (newValue) => {
    window.electron.ipcRenderer.send('control.leftBarWidth.change', newValue)
  })

  window.electron.ipcRenderer.on('control.uiLanguage.set', (_, args: UILanguage) => {
    uiLanguage.value = args
  })

  window.electron.ipcRenderer.on('control.nativeTheme.change', (_, args) => {
    if(args === 'light') setLightTheme()
    else if(args === 'dark') setDarkTheme()
  })

  function setLightTheme(){
    antdTheme.value = antDesignTheme.light
    const root = document.documentElement
    root.style.setProperty('--control-background', '#fff')
    root.style.setProperty('--tag-color', 'rgba(0, 0, 0, 0.45)')
    root.style.setProperty('--icon-color', 'rgba(0, 0, 0, 0.88)')
  }

  function setDarkTheme(){
    antdTheme.value = antDesignTheme.dark
    const root = document.documentElement
    root.style.setProperty('--control-background', '#000')
    root.style.setProperty('--tag-color', 'rgba(255, 255, 255, 0.45)')
    root.style.setProperty('--icon-color', 'rgba(255, 255, 255, 0.85)')
  }

  return {
    uiLanguage,
    uiTheme,
    leftBarWidth,
    antdTheme
  }
})
