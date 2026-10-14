import { theme } from 'ant-design-vue';
import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context'

let isLight = true
let themeColor = '#1677ff'

export function setThemeColor(color: string): void {
  themeColor = color
}

export function getTheme(curIsLight?: boolean): ThemeConfig {
  const lightTheme = {
    token: {
      colorPrimary: themeColor,
      colorInfo: themeColor
    }
  }
  const darkTheme = {
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: themeColor,
      colorInfo: themeColor
    }
  }

  if(curIsLight !== undefined){
    isLight = curIsLight
  }
  return isLight ? lightTheme : darkTheme
}
