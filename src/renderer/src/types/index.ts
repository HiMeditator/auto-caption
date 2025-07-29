export type UILanguage =  "zh" | "en" | "ja"

export type UITheme = "light" | "dark" | "system"

export interface Controls {
  engineEnabled: boolean,
  sourceLang: string,
  targetLang: string,
  engine: string,
  audio: 0 | 1,
  translation: boolean,
  API_KEY: string,
  modelPath: string,
  customized: boolean,
  customizedApp: string,
  customizedCommand: string
}

export interface Styles {
  lineBreak: number,
  fontFamily: string,
  fontSize: number,
  fontColor: string,
  fontWeight: number,
  background: string,
  opacity: number,
  showPreview: boolean,
  transDisplay: boolean,
  transFontFamily: string,
  transFontSize: number,
  transFontColor: string,
  transFontWeight: number,
  textShadow: boolean,
  offsetX: number,
  offsetY: number,
  blur: number,
  textShadowColor: string
}

export interface CaptionItem {
  index: number,
  time_s: string,
  time_t: string,
  text: string,
  translation: string
}

export interface FullConfig {
  platform: string,
  uiLanguage: UILanguage,
  uiTheme: UITheme,
  leftBarWidth: number,
  styles: Styles,
  controls: Controls,
  captionLog: CaptionItem[]
}

export interface EngineInfo {
  pid: number,
  ppid: number,
  port:number,
  cpu: number,
  mem: number,
  elapsed: number
}