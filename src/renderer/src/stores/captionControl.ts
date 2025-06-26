import { ref } from 'vue'
import { defineStore } from 'pinia'

import { notification } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { h } from 'vue'

export const useCaptionControlStore = defineStore('captionControl', () => {
  const captionEngine = ref([
    {
      value: 'gummy',
      label: '云端-阿里云-Gummy',
      languages: [
        { value: 'auto', label: '自动检测' },
        { value: 'en', label: '英语' },
        { value: 'zh', label: '中文' },
        { value: 'ja', label: '日语' },
        { value: 'ko', label: '韩语' },
        { value: 'de', label: '德语' },
        { value: 'fr', label: '法语' },
        { value: 'ru', label: '俄语' },
        { value: 'es', label: '西班牙语' },
        { value: 'it', label: '意大利语' },
      ]
    },
  ])
  const audioType = ref([
    {
      value: 0,
      label: '系统音频输出（扬声器）'
    },
    {
      value: 1,
      label: '系统音频输入（麦克风）'
    }
  ])

  const engineEnabled = ref(false)

  const sourceLang = ref<string>('en')
  const targetLang = ref<string>('zh')
  const engine = ref<string>('gummy')
  const audio = ref<0 | 1>(0)
  const translation = ref<boolean>(true)
  const customized = ref<boolean>(false)
  const customizedApp = ref<string>('')
  const customizedCommand = ref<string>('')

  const changeSignal = ref<boolean>(false)

  function sendControlChange() {
    const controls = {
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
    window.electron.ipcRenderer.send('control.control.change', controls)
  }

  function startEngine() {
    window.electron.ipcRenderer.send('control.engine.start')
  }

  function stopEngine() {
    window.electron.ipcRenderer.send('control.engine.stop')
  }

  window.electron.ipcRenderer.on('control.control.set', (_, controls) => {
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

  window.electron.ipcRenderer.on('control.error.send', (_, message) => { 
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
    sendControlChange,  // 发送最新控制消息到后端
    startEngine,        // 启动字幕引擎
    stopEngine,         // 停止字幕引擎
    changeSignal,       // 配置改变信号
  }
})