import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { Styles } from '@renderer/types'
import { breakOptions } from '@renderer/i18n'

export const useCaptionStyleStore = defineStore('captionStyle', () => {
  const lineBreak = ref<number>(1)
  const fontFamily = ref<string>('sans-serif')
  const fontSize = ref<number>(24)
  const fontColor = ref<string>('#000000')
  const background = ref<string>('#dbe2ef')
  const opacity = ref<number>(80)
  const showPreview = ref<boolean>(true)
  const transDisplay = ref<boolean>(true)
  const transFontFamily = ref<string>('sans-serif')
  const transFontSize = ref<number>(24)
  const transFontColor = ref<string>('#000000')

  const iBreakOptions = ref(breakOptions['zh'])
  const changeSignal = ref<boolean>(false)

  function addOpicityToColor(color: string, opicity: number) {
    const opicityValue = Math.round(opicity * 255 / 100);
    const opicityHex = opicityValue.toString(16).padStart(2, '0');
    return `${color}${opicityHex}`;
  }

  const backgroundRGBA = computed(() => {
    return addOpicityToColor(background.value, opacity.value)
  })

  function sendStylesChange() {
    const styles: Styles = {
      lineBreak: lineBreak.value,
      fontFamily: fontFamily.value,
      fontSize: fontSize.value,
      fontColor: fontColor.value,
      background: background.value,
      opacity: opacity.value,
      showPreview: showPreview.value,
      transDisplay: transDisplay.value,
      transFontFamily: transFontFamily.value,
      transFontSize: transFontSize.value,
      transFontColor: transFontColor.value
    }
    window.electron.ipcRenderer.send('control.styles.change', styles)
  }

  function sendStylesReset() {
    window.electron.ipcRenderer.send('control.styles.reset')
  }

  function setStyles(args: Styles){
    lineBreak.value = args.lineBreak
    fontFamily.value = args.fontFamily
    fontSize.value = args.fontSize
    fontColor.value = args.fontColor
    background.value = args.background
    opacity.value = args.opacity
    showPreview.value = args.showPreview
    transDisplay.value = args.transDisplay
    transFontFamily.value = args.transFontFamily
    transFontSize.value = args.transFontSize
    transFontColor.value = args.transFontColor
    changeSignal.value = true
  }

  window.electron.ipcRenderer.on('both.styles.set', (_, args: Styles) => {
    setStyles(args)
  })

  return {
    lineBreak,          // 换行方式
    fontFamily,         // 字体族
    fontSize,           // 字体大小
    fontColor,          // 字体颜色
    background,         // 背景颜色
    opacity,            // 背景透明度
    showPreview,        // 是否显示预览
    transDisplay,       // 是否显示翻译
    transFontFamily,    // 翻译字体族
    transFontSize,      // 翻译字体大小
    transFontColor,     // 翻译字体颜色
    backgroundRGBA,     // 带透明度的背景颜色
    setStyles,          // 设置样式
    sendStylesChange,   // 发送样式改变
    sendStylesReset,    // 恢复默认样式
    iBreakOptions,      // 换行选项
    changeSignal        // 样式改变信号
  }
})
