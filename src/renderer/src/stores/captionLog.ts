import { ref } from 'vue'
import { defineStore } from 'pinia'
import { CaptionItem } from '../types'

export const useCaptionLogStore = defineStore('captionLog', () => {
  const captionData = ref<CaptionItem[]>([])

  function clear() {
    window.electron.ipcRenderer.invoke('control.captionLog.clear').then((data: CaptionItem[]) => {
      captionData.value = data
    })
  }

  window.electron.ipcRenderer.on('both.captionLog.add', (_, log) => {
    captionData.value.push(log)
  })

  window.electron.ipcRenderer.on('both.captionLog.upd', (_, log) => {
    captionData.value.splice(captionData.value.length - 1, 1, log)
  })

  window.electron.ipcRenderer.on('both.captionLog.set', (_, logs) => {
    captionData.value = logs
  })

  return {
    captionData,
    clear
  }
})
