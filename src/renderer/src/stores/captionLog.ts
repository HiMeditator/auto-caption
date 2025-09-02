import { ref } from 'vue'
import { defineStore } from 'pinia'
import { CaptionItem } from '../types'

export const useCaptionLogStore = defineStore('captionLog', () => {
  const captionData = ref<CaptionItem[]>([])

  function clear() {
    captionData.value = []
    window.electron.ipcRenderer.send('control.captionLog.clear')
  }

  window.electron.ipcRenderer.on('both.captionLog.add', (_, log) => {
    captionData.value.push(log)
  })

  window.electron.ipcRenderer.on('both.captionLog.upd', (_, log) => {
    for(let i = captionData.value.length - 1; i >= 0; i--) {
      if(captionData.value[i].time_s === log.time_s){
        captionData.value.splice(i, 1, log)
        break
      }
    }
  })

  window.electron.ipcRenderer.on('both.captionLog.set', (_, logs) => {
    captionData.value = logs
  })

  return {
    captionData,
    clear
  }
})
