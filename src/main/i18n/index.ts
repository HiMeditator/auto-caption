import zh from './lang/zh'
import en from './lang/en'
import ja from './lang/ja'
import { allConfig } from '../utils/AllConfig'

export function i18n(key: string): string{
  if(allConfig.uiLanguage === 'zh') return zh[key] || key
  else if(allConfig.uiLanguage === 'en') return en[key] || key
  else if(allConfig.uiLanguage === 'ja') return ja[key] || key
  else return key
}
