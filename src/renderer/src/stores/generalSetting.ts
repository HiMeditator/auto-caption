import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useGeneralSettingStore = defineStore('generalSetting', () => {
  const leftBarWidth = ref<number>(8)
  return {
    leftBarWidth
  }
})
