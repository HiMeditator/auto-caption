export interface Styles {
  fontFamily: string,
  fontSize: number,
  fontColor: string,
  background: string,
  opacity: number,
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

export interface Controls {
  sourceLang: string,
  targetLang: string,
  engine: string,
  translation: boolean,
  customized: boolean,
  customizedApp: string,
  customizedCommand: string
}