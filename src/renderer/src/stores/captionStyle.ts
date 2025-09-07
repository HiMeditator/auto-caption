import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { Styles } from '@renderer/types'
import { breakOptions } from '@renderer/i18n'

export const useCaptionStyleStore = defineStore('captionStyle', () => {
  const lineNumber = ref<number>(1)
  const lineBreak = ref<number>(1)
  const fontFamily = ref<string>('sans-serif')
  const fontSize = ref<number>(24)
  const fontColor = ref<string>('#000000')
  const fontWeight = ref<number>(4)
  const background = ref<string>('#dbe2ef')
  const opacity = ref<number>(80)
  const showPreview = ref<boolean>(true)
  const transDisplay = ref<boolean>(true)
  const transFontFamily = ref<string>('sans-serif')
  const transFontSize = ref<number>(24)
  const transFontColor = ref<string>('#000000')
  const transFontWeight = ref<number>(4)
  const textShadow = ref<boolean>(false)
  const offsetX = ref<number>(2)
  const offsetY = ref<number>(2)
  const blur = ref<number>(0)
  const textShadowColor = ref<string>('#ffffff')

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
      lineNumber: lineNumber.value,
      lineBreak: lineBreak.value,
      fontFamily: fontFamily.value,
      fontSize: fontSize.value,
      fontColor: fontColor.value,
      fontWeight: fontWeight.value,
      background: background.value,
      opacity: opacity.value,
      showPreview: showPreview.value,
      transDisplay: transDisplay.value,
      transFontFamily: transFontFamily.value,
      transFontSize: transFontSize.value,
      transFontColor: transFontColor.value,
      transFontWeight: transFontWeight.value,
      textShadow: textShadow.value,
      offsetX: offsetX.value,
      offsetY: offsetY.value,
      blur: blur.value,
      textShadowColor: textShadowColor.value
    }
    window.electron.ipcRenderer.send('control.styles.change', styles)
  }

  function sendStylesReset() {
    window.electron.ipcRenderer.send('control.styles.reset')
  }

  function setStyles(args: Styles){
    lineNumber.value = args.lineNumber
    lineBreak.value = args.lineBreak
    fontFamily.value = args.fontFamily
    fontSize.value = args.fontSize
    fontColor.value = args.fontColor
    fontWeight.value = args.fontWeight
    background.value = args.background
    opacity.value = args.opacity
    showPreview.value = args.showPreview
    transDisplay.value = args.transDisplay
    transFontFamily.value = args.transFontFamily
    transFontSize.value = args.transFontSize
    transFontColor.value = args.transFontColor,
    transFontWeight.value = args.transFontWeight
    textShadow.value = args.textShadow
    offsetX.value = args.offsetX
    offsetY.value = args.offsetY
    blur.value = args.blur
    textShadowColor.value = args.textShadowColor
    changeSignal.value = true
  }

  window.electron.ipcRenderer.on('both.styles.set', (_, args: Styles) => {
    setStyles(args)
  })

  return {
    lineNumber,         // 显示字幕行数 
    lineBreak,          // 换行方式
    fontFamily,         // 字体族
    fontSize,           // 字体大小
    fontColor,          // 字体颜色
    fontWeight,         // 字体粗细
    background,         // 背景颜色
    opacity,            // 背景透明度
    showPreview,        // 是否显示预览
    transDisplay,       // 是否显示翻译
    transFontFamily,    // 翻译字体族
    transFontSize,      // 翻译字体大小
    transFontColor,     // 翻译字体颜色
    transFontWeight,    // 翻译字体粗细
    textShadow,         // 是否显示文本阴影
    offsetX,            // 阴影X轴偏移
    offsetY,            // 阴影Y轴偏移
    blur,               // 阴影模糊度半径
    textShadowColor,    // 阴影颜色
    backgroundRGBA,     // 带透明度的背景颜色
    setStyles,          // 设置样式
    sendStylesChange,   // 发送样式改变
    sendStylesReset,    // 恢复默认样式
    iBreakOptions,      // 换行选项
    changeSignal        // 样式改变信号
  }
})
