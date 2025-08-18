import { theme } from 'ant-design-vue';

let isLight = true
let themeColor = '#1677ff'

export function setThemeColor(color: string) {
  themeColor = color
}

export function getTheme(curIsLight?: boolean) {
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