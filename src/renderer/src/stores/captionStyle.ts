import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCaptionStyleStore = defineStore('captionStyle', () => {
  const fontFamily = ref<string>('sans-serif')
  const fontSize = ref<number>(24)
  const fontColor = ref<string>('#000000')
  const background = ref<string>('#dbe2ef')
  const opacity = ref<number>(50)
  const transDisplay = ref<boolean>(true)
  const transFontFamily = ref<string>('sans-serif')
  const transFontSize = ref<number>(24)
  const transFontColor = ref<string>('#000000')
  return {
    fontFamily,         // 字体族
    fontSize,           // 字体大小
    fontColor,          // 字体颜色
    background,         // 背景颜色
    opacity,            // 背景透明度
    transDisplay,       // 是否显示翻译
    transFontFamily,    // 翻译字体族
    transFontSize,      // 翻译字体大小
    transFontColor      // 翻译字体颜色
  }
})