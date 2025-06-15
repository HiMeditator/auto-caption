import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCaptionStore = defineStore('caption', () => {
  const captionFontFamily = ref<string>('sans-serif')
  const captionFontSize = ref<number>(24)
  const captionFontColor = ref<string>('#ffffff')
  const backgroundColor = ref<string>('#000000')
  return {
    captionFontFamily,
    captionFontSize,
    captionFontColor,
    backgroundColor
  }
})