import { ref } from 'vue'
import { defineStore } from 'pinia'

import { notification } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { h } from 'vue'
import { useI18n } from 'vue-i18n'

import { Controls } from '@renderer/types'
import { engines, audioTypes } from '@renderer/i18n'
import { useGeneralSettingStore } from './generalSetting'

export const useEngineControlStore = defineStore('engineControl', () => {
  const { t } = useI18n()

  const captionEngine = ref(engines[useGeneralSettingStore().uiLanguage])
  const audioType = ref(audioTypes[useGeneralSettingStore().uiLanguage])

  const engineEnabled = ref(false)
  const sourceLang = ref<string>('en')
  const targetLang = ref<string>('zh')
  const engine = ref<'gummy'>('gummy')
  const audio = ref<0 | 1>(0)
  const translation = ref<boolean>(true)
  const customized = ref<boolean>(false)
  const customizedApp = ref<string>('')
  const customizedCommand = ref<string>('')

  const changeSignal = ref<boolean>(false)

  function sendControlsChange() {
    const controls: Controls = {
      engineEnabled: engineEnabled.value,
      sourceLang: sourceLang.value,
      targetLang: targetLang.value,
      engine: engine.value,
      audio: audio.value,
      translation: translation.value,
      customized: customized.value,
      customizedApp: customizedApp.value,
      customizedCommand: customizedCommand.value
    }
    window.electron.ipcRenderer.send('control.controls.change', controls)
  }

  function setControls(controls: Controls) {
    sourceLang.value = controls.sourceLang
    targetLang.value = controls.targetLang
    engine.value = controls.engine
    audio.value = controls.audio
    engineEnabled.value = controls.engineEnabled
    translation.value = controls.translation
    customized.value = controls.customized
    customizedApp.value = controls.customizedApp
    customizedCommand.value = controls.customizedCommand
    changeSignal.value = true
  }

  window.electron.ipcRenderer.on('control.controls.set', (_, controls: Controls) => {
    setControls(controls)
  })

  window.electron.ipcRenderer.on('control.engine.started', (_, args) => {
    const str0 =
      `${t('noti.sLang')}${sourceLang.value}${t('noti.trans')}${translation.value?'yes':'no'}` +
      `${t('noti.engine')}${engine.value}${t('noti.audio')}${audio.value?t('noti.sysin'):t('noti.sysout')}` +
      (translation.value ? `${t('noti.tLang')}${targetLang.value}` : '');
    const str1 = `${t('noti.custom')}${customizedApp.value}${t('noti.args')}${customizedCommand.value}`;
    notification.open({
      message: t('noti.started'),
      description:
        ((customized.value && customizedApp.value) ? str1 : str0) +
        `${t('noti.pidInfo')}${args}`
    });
  })

  window.electron.ipcRenderer.on('control.engine.stopped', () => {
    notification.open({
      message: t('noti.stopped'),
      description: t('noti.stoppedInfo')
    });
  })

  window.electron.ipcRenderer.on('control.error.occurred', (_, message) => {
    notification.open({
      message: t('noti.error'),
      description: message,
      duration: null,
      placement: 'topLeft',
      icon: () => h(ExclamationCircleOutlined, { style: 'color: #ff4d4f' })
    });
  })

  return {
    captionEngine,      // 字幕引擎
    audioType,          // 音频类型
    engineEnabled,      // 字幕引擎是否启用
    sourceLang,         // 源语言
    targetLang,         // 目标语言
    engine,             // 字幕引擎
    audio,              // 选择音频
    translation,        // 是否启用翻译
    customized,         // 是否使用自定义字幕引擎
    customizedApp,      // 自定义字幕引擎的应用程序
    customizedCommand,  // 自定义字幕引擎的命令
    setControls,        // 设置引擎配置
    sendControlsChange, // 发送最新控制消息到后端
    changeSignal,       // 配置改变信号
  }
})
