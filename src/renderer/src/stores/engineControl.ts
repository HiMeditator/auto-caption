import { ref } from 'vue'
import { defineStore } from 'pinia'

import { notification } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { h } from 'vue'

import { Controls } from '@renderer/types'
import { engines, audioTypes } from '@renderer/i18n'
import { useGeneralSettingStore } from './generalSetting'

export const useEngineControlStore = defineStore('engineControl', () => {
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

  window.electron.ipcRenderer.on('control.controls.set', (_, controls: Controls) => {
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
  })

  window.electron.ipcRenderer.on('control.engine.already', () => {
    // TODO 修改为重启
    notification.open({
      message: '字幕引擎已经启动',
      description: '字幕引擎已经启动，请勿重复启动'
    });
  })

  window.electron.ipcRenderer.on('control.engine.started', () => {
    const str0 =
      `原语言：${sourceLang.value}，是否翻译：${translation.value?'是':'否'}，` +
      `字幕引擎：${engine.value}，音频类型：${audio.value ? '输入音频' : '输出音频'}` +
      (translation.value ? `，翻译语言：${targetLang.value}` : '');
    const str1 = `类型：自定义引擎，引擎路径：${customizedApp.value}，命令参数：${customizedCommand.value}`;
    notification.open({
      message: '字幕引擎启动',
      description: (customized.value && customizedApp.value) ? str1 : str0
    });
  })

  window.electron.ipcRenderer.on('control.engine.stopped', () => {
    notification.open({
      message: '字幕引擎停止',
      description: '可点击“启动字幕引擎”按钮重新启动'
    });
  })

  window.electron.ipcRenderer.on('control.error.occurred', (_, message) => {
    notification.open({
      message: '发生错误',
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
    sendControlsChange,  // 发送最新控制消息到后端
    changeSignal,       // 配置改变信号
  }
})
