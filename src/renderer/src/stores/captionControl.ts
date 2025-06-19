import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCaptionControlStore = defineStore('captionControl', () => {
  const captionEngine = ref([
    {
      value: 'gummy',
      label: '云端-阿里云-Gummy',
      languages: [
        { value: 'auto', label: '自动检测' },
        { value: 'en', label: '英语' },
        { value: 'zh', label: '简体中文' },
        { value: 'ja', label: '日语' },
        { value: 'ko', label: '韩语' }
      ]
    },
    {
      value: 'whisper',
      label: '本地-OpenAI-Whisper',
      languages: [
        { value: 'auto', label: '自动检测' },
        { value: 'en', label: '英语' },
        { value: 'zh', label: '简体中文' }
      ]
    },
  ])

  const sourceLang = ref<string>('auto')
  const targetLang = ref<string>('zh')
  const engine = ref<string>('gummy')
  const translation = ref<boolean>(false)
  const customized = ref<boolean>(false)
  const customizedApp = ref<string>('')
  const customizedCommand = ref<string>('')


  function sendControlChange() {
    const controls = {
      sourceLang: sourceLang.value,
      targetLang: targetLang.value,
      engine: engine.value,
      translation: translation.value,
      customized: customized.value,
      customizedApp: customizedApp.value,
      customizedCommand: customizedCommand.value
    }
    window.electron.ipcRenderer.send('control.control.change', controls)
  }

  return {
    captionEngine,      // 字幕引擎
    sourceLang,         // 源语言
    targetLang,         // 目标语言
    engine,             // 字幕引擎
    translation,        // 是否启用翻译
    customized,         // 是否使用自定义字幕引擎
    customizedApp,      // 自定义字幕引擎的应用程序
    customizedCommand,  // 自定义字幕引擎的命令
    sendControlChange   // 发送最新控制消息到后端
  }
})