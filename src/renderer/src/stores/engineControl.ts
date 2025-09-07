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
  const platform = ref('unknown')

  const captionEngine = ref(engines[useGeneralSettingStore().uiLanguage])
  const audioType = ref(audioTypes[useGeneralSettingStore().uiLanguage])
  const engineEnabled = ref(false)
  const sourceLang = ref<string>('en')
  const targetLang = ref<string>('zh')
  const transModel = ref<string>('ollama')
  const ollamaName = ref<string>('')
  const engine = ref<string>('gummy')
  const audio = ref<0 | 1>(0)
  const translation = ref<boolean>(true)
  const recording = ref<boolean>(false)
  const API_KEY = ref<string>('')
  const voskModelPath = ref<string>('')
  const sosvModelPath = ref<string>('')
  const recordingPath = ref<string>('')
  const customized = ref<boolean>(false)
  const customizedApp = ref<string>('')
  const customizedCommand = ref<string>('')
  const startTimeoutSeconds = ref<number>(30)

  const changeSignal = ref<boolean>(false)
  const errorSignal = ref<boolean>(false)

  function sendControlsChange() {
    const controls: Controls = {
      engineEnabled: engineEnabled.value,
      sourceLang: sourceLang.value,
      targetLang: targetLang.value,
      transModel: transModel.value,
      ollamaName: ollamaName.value,
      engine: engine.value,
      audio: audio.value,
      translation: translation.value,
      recording: recording.value,
      API_KEY: API_KEY.value,
      voskModelPath: voskModelPath.value,
      sosvModelPath: sosvModelPath.value,
      recordingPath: recordingPath.value,
      customized: customized.value,
      customizedApp: customizedApp.value,
      customizedCommand: customizedCommand.value,
      startTimeoutSeconds: startTimeoutSeconds.value
    }
    window.electron.ipcRenderer.send('control.controls.change', controls)
  }

  function setControls(controls: Controls, set = false) {
    if(set && !engineEnabled.value && !controls.engineEnabled) {
      errorSignal.value = true
      notification.open({
        message: t('noti.error'),
        description: t("noti.engineError"),
        duration: null,
        icon: () => h(ExclamationCircleOutlined, { style: 'color: #ff4d4f' })
      });
      notification.open({
        message: t('noti.error'),
        description: t("noti.socketError"),
        duration: null,
        icon: () => h(ExclamationCircleOutlined, { style: 'color: #ff4d4f' })
      });
    }
    sourceLang.value = controls.sourceLang
    targetLang.value = controls.targetLang
    transModel.value = controls.transModel
    ollamaName.value = controls.ollamaName
    engine.value = controls.engine
    audio.value = controls.audio
    engineEnabled.value = controls.engineEnabled
    translation.value = controls.translation
    recording.value = controls.recording
    API_KEY.value = controls.API_KEY
    voskModelPath.value = controls.voskModelPath
    sosvModelPath.value = controls.sosvModelPath
    recordingPath.value = controls.recordingPath
    customized.value = controls.customized
    customizedApp.value = controls.customizedApp
    customizedCommand.value = controls.customizedCommand
    startTimeoutSeconds.value = controls.startTimeoutSeconds
    changeSignal.value = true
  }

  function emptyModelPathErr() {
    notification.open({
      message: t('noti.empty'),
      description: t('noti.emptyInfo'),
      duration: null,
      icon: () => h(ExclamationCircleOutlined, { style: 'color: #ff4d4f' })
    });
  }

  window.electron.ipcRenderer.on('control.controls.set', (_, controls: Controls) => {
    setControls(controls, true)
  })

  window.electron.ipcRenderer.on('control.engine.started', (_, args) => {
    const str0 =
      `${t('noti.sLang')}${sourceLang.value}${t('noti.trans')}${translation.value?'yes':'no'}` +
      `${t('noti.engine')}${engine.value}${t('noti.audio')}${audio.value?t('noti.sysin'):t('noti.sysout')}` +
      (translation.value ? `${t('noti.tLang')}${targetLang.value}` : '');
    const str1 = `${t('noti.custom')}${customizedApp.value}${t('noti.args')}${customizedCommand.value}`;
    notification.open({
      placement: 'topLeft',
      message: t('noti.started'),
      description:
        (customized.value ? str1 : str0) +
        `${t('noti.pidInfo')}${args}`
    });
  })

  window.electron.ipcRenderer.on('control.engine.stopped', () => {
    notification.open({
      placement: 'topLeft',
      message: t('noti.stopped'),
      description: t('noti.stoppedInfo')
    });
  })

  window.electron.ipcRenderer.on('control.error.occurred', (_, message) => {
    notification.open({
      message: t('noti.error'),
      description: message,
      duration: null,
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
    transModel,         // 翻译模型
    ollamaName,         // Ollama 模型
    engine,             // 字幕引擎
    audio,              // 选择音频
    translation,        // 是否启用翻译
    recording,          // 是否启用录音
    API_KEY,            // API KEY
    voskModelPath,      // vosk 模型路径
    sosvModelPath,      // sosv 模型路径
    recordingPath,      // 录音保存路径
    customized,         // 是否使用自定义字幕引擎
    customizedApp,      // 自定义字幕引擎的应用程序
    customizedCommand,  // 自定义字幕引擎的命令
    startTimeoutSeconds, // 启动超时时间（秒）
    setControls,        // 设置引擎配置
    sendControlsChange, // 发送最新控制消息到后端
    emptyModelPathErr,  // 模型路径为空时显示警告
    changeSignal,       // 配置改变信号
    errorSignal,        // 错误信号
  }
})
