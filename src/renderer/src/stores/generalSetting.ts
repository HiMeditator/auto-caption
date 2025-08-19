import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { i18n } from '../i18n'
import type { UILanguage, UITheme } from '../types'

import { engines, audioTypes, breakOptions, setThemeColor, getTheme } from '../i18n'
import { useEngineControlStore } from './engineControl'
import { useCaptionStyleStore } from './captionStyle'

type RealTheme = 'light' | 'dark'

export const useGeneralSettingStore = defineStore('generalSetting', () => {
  const uiLanguage = ref<UILanguage>('zh')
  const realTheme = ref<RealTheme>('light')
  const uiTheme = ref<UITheme>('system')
  const uiColor = ref<string>('#1677ff')
  const leftBarWidth = ref<number>(8)

  const antdTheme = ref<Object>(getTheme())

  function handleThemeChange(newTheme: RealTheme) {
    realTheme.value = newTheme
    if(newTheme === 'dark' && uiColor.value === '#000000') {
      uiColor.value = '#b9d7ea'
    }
    if(newTheme === 'light' && uiColor.value === '#b9d7ea') {
      uiColor.value = '#000000'
    }
  }

  window.electron.ipcRenderer.invoke('control.nativeTheme.get').then((theme) => {
    if(theme === 'light') setLightTheme()
    else if(theme === 'dark') setDarkTheme()
    handleThemeChange(theme)
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
      window.electron.ipcRenderer.invoke('control.nativeTheme.get').then((theme: RealTheme) => {
        if(theme === 'light') setLightTheme()
        else if(theme === 'dark') setDarkTheme()
        handleThemeChange(theme)
      })
    }
    else if(newValue === 'light'){
      setLightTheme()
      handleThemeChange('light')
    }
    else if(newValue === 'dark') {
      setDarkTheme()
      handleThemeChange('dark')
    }
  })

  watch(uiColor, (newValue) => {
    setThemeColor(newValue)
    antdTheme.value = getTheme()
    window.electron.ipcRenderer.send('control.uiColor.change', newValue)
  })

  watch(leftBarWidth, (newValue) => {
    window.electron.ipcRenderer.send('control.leftBarWidth.change', newValue)
  })

  watch(realTheme, (newValue) => { 
    console.log('realTheme', newValue)
  })

  window.electron.ipcRenderer.on('control.uiLanguage.set', (_, args: UILanguage) => {
    uiLanguage.value = args
  })

  window.electron.ipcRenderer.on('control.nativeTheme.change', (_, args: RealTheme) => {
    if(args === 'light') setLightTheme()
    else if(args === 'dark') setDarkTheme()
    handleThemeChange(args)
  })

  function setLightTheme(){
    antdTheme.value = getTheme(true)
    const root = document.documentElement
    root.style.setProperty('--control-background', '#fff')
    root.style.setProperty('--tag-color', 'rgba(0, 0, 0, 0.45)')
    root.style.setProperty('--icon-color', 'rgba(0, 0, 0, 0.88)')
  }

  function setDarkTheme(){
    antdTheme.value = getTheme(false)
    const root = document.documentElement
    root.style.setProperty('--control-background', '#000')
    root.style.setProperty('--tag-color', 'rgba(255, 255, 255, 0.45)')
    root.style.setProperty('--icon-color', 'rgba(255, 255, 255, 0.85)')
  }

  return {
    uiLanguage,
    realTheme,
    uiTheme,
    uiColor,
    leftBarWidth,
    antdTheme
  }
})
