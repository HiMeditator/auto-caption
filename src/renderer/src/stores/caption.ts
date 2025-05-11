import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCaptionStore = defineStore('caption', () => {
  const captionFontFamily = ref<string>('sans-serif')
  const captionFontSize = ref<number>(24)
  const captionFontColor = ref<string>('#ffffff')
  return { captionFontFamily, captionFontSize, captionFontColor }
})