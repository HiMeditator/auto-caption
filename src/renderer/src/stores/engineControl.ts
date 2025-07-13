import { ref, watch } from 'vue'
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
  const platform = ref('unknown')

  const captionEngine = ref(engines[useGeneralSettingStore().uiLanguage])
  const audioType = ref(audioTypes[useGeneralSettingStore().uiLanguage])
  const engineEnabled = ref(false)
  const sourceLang = ref<string>('en')
  const targetLang = ref<string>('zh')
  const engine = ref<string>('gummy')
  const audio = ref<0 | 1>(0)
  const translation = ref<boolean>(true)
  const API_KEY = ref<string>('')
  const modelPath = ref<string>('')
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
      API_KEY: API_KEY.value,
      modelPath: modelPath.value,
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
    API_KEY.value = controls.API_KEY
    modelPath.value = controls.modelPath
    customized.value = controls.customized
    customizedApp.value = controls.customizedApp
    customizedCommand.value = controls.customizedCommand
    changeSignal.value = true
  }

  function emptyModelPathErr() {
    notification.open({
      message: t('noti.empty'),
      description: t('noti.emptyInfo')
    });
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
    platform,           // 系统平台
    captionEngine,      // 字幕引擎列表
    audioType,          // 音频类型
    engineEnabled,      // 字幕引擎是否启用
    sourceLang,         // 源语言
    targetLang,         // 目标语言
    engine,             // 字幕引擎
    audio,              // 选择音频
    translation,        // 是否启用翻译
    API_KEY,            // API KEY
    modelPath,          // vosk 模型路径
    customized,         // 是否使用自定义字幕引擎
    customizedApp,      // 自定义字幕引擎的应用程序
    customizedCommand,  // 自定义字幕引擎的命令
    setControls,        // 设置引擎配置
    sendControlsChange, // 发送最新控制消息到后端
    emptyModelPathErr,  // 模型路径为空时显示警告
    changeSignal,       // 配置改变信号
  }
})
