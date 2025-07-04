export type UILanguage =  "zh" | "en" | "ja"

export type UITheme = "light" | "dark" | "system"

export interface Controls {
  engineEnabled: boolean,
  sourceLang: string,
  targetLang: string,
  engine: 'gummy',
  audio: 0 | 1,
  translation: boolean,
  customized: boolean,
  customizedApp: string,
  customizedCommand: string
}

export interface Styles {
  fontFamily: string,
  fontSize: number,
  fontColor: string,
  background: string,
  opacity: number,
  showPreview: boolean,
  transDisplay: boolean,
  transFontFamily: string,
  transFontSize: number,
  transFontColor: string
}

export interface CaptionItem {
  index: number,
  time_s: string,
  time_t: string,
  text: string,
  translation: string
}

export interface FullConfig {
  uiLanguage: UILanguage,
  uiTheme: UITheme,
  leftBarWidth: number,
  styles: Styles,
  controls: Controls,
  captionLog: CaptionItem[]
}
