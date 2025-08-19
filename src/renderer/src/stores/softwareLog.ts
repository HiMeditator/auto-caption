import { ref } from 'vue'
import { defineStore } from 'pinia'
import { type SoftwareLogItem } from '../types'

export const useSoftwareLogStore = defineStore('softwareLog', () => {
  const softwareLogs = ref<SoftwareLogItem[]>([])

  function clear() {
    softwareLogs.value = []
  }

  window.electron.ipcRenderer.on('control.softwareLog.add', (_, log) => {
    softwareLogs.value.push(log)
    console.log(log)
  })

  return {
    softwareLogs,
    clear
  }
})
