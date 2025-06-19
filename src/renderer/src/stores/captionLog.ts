import { ref } from 'vue'
import { defineStore } from 'pinia'

interface CaptionItem {
  index: number,
  time_s: string,
  time_t: string,
  text: string,
  translation: string
}

export const useCaptionLogStore = defineStore('captionLog', () => {
  const captionData = ref<CaptionItem[]>([])

  window.electron.ipcRenderer.on('both.log.set', (_, logs) => {
    captionData.value = logs
  })

  return {
    captionData
  }
})