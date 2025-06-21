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

  window.electron.ipcRenderer.on('both.log.add', (_, log) => {
    if(captionData.value.length && log.index === captionData.value[captionData.value.length - 1].index) {
      captionData.value.splice(captionData.value.length - 1, 1, log)
    }
    else {
      captionData.value.push(log)
    }
  })

  function clear() {
    captionData.value = []
    window.electron.ipcRenderer.send('control.caption.clear')
  }

  window.electron.ipcRenderer.on('both.log.set', (_, logs) => {
    captionData.value = logs
  })

  return {
    captionData,
    clear
  }
})