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
  const targetLang = ref<string>('')
  const engine = ref<string>('gummy')
  const port = ref<number>(8765)
  const translation = ref<boolean>(false)

  return {
    captionEngine,  // 字幕引擎
    sourceLang,     // 源语言
    targetLang,     // 目标语言
    engine,         // 字幕引擎
    port,           // 端口
    translation     // 是否启用翻译
  }
})