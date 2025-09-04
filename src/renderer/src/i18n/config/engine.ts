export const engines = {
  zh: [
    {
      value: 'gummy',
      label: '云端 - 阿里云 - Gummy',
      languages: [
        { value: 'auto', label: '自动检测' },
        { value: 'en', label: '英语' },
        { value: 'zh', label: '中文' },
        { value: 'ja', label: '日语' },
        { value: 'ko', label: '韩语' },
        { value: 'de', label: '德语' },
        { value: 'fr', label: '法语' },
        { value: 'ru', label: '俄语' },
        { value: 'es', label: '西班牙语' },
        { value: 'it', label: '意大利语' },
      ]
    },
    {
      value: 'vosk',
      label: '本地 -  Vosk',
      languages: [
        { value: 'auto', label: '需要自行配置模型' },
        { value: 'en', label: '英语' },
        { value: 'zh-cn', label: '中文' },
        { value: 'ja', label: '日语' },
        { value: 'ko', label: '韩语' },
        { value: 'de', label: '德语' },
        { value: 'fr', label: '法语' },
        { value: 'ru', label: '俄语' },
        { value: 'es', label: '西班牙语' },
        { value: 'it', label: '意大利语' },
      ],
      transModel: [
        { value: 'ollama', label: 'Ollama 本地模型' },
        { value: 'google', label: 'Google API 调用' },
      ]
    }
  ],
  en: [
    {
      value: 'gummy',
      label: 'Cloud - Alibaba Cloud - Gummy',
      languages: [
        { value: 'auto', label: 'Auto Detect' },
        { value: 'en', label: 'English' },
        { value: 'zh', label: 'Chinese' },
        { value: 'ja', label: 'Japanese' },
        { value: 'ko', label: 'Korean' },
        { value: 'de', label: 'German' },
        { value: 'fr', label: 'French' },
        { value: 'ru', label: 'Russian' },
        { value: 'es', label: 'Spanish' },
        { value: 'it', label: 'Italian' },
      ]
    },
    {
      value: 'vosk',
      label: 'Local - Vosk',
      languages: [
        { value: 'auto', label: 'Model needs to be configured manually' },
        { value: 'en', label: 'English' },
        { value: 'zh-cn', label: 'Chinese' },
        { value: 'ja', label: 'Japanese' },
        { value: 'ko', label: 'Korean' },
        { value: 'de', label: 'German' },
        { value: 'fr', label: 'French' },
        { value: 'ru', label: 'Russian' },
        { value: 'es', label: 'Spanish' },
        { value: 'it', label: 'Italian' },
      ],
      transModel: [
        { value: 'ollama', label: 'Ollama Local Model' },
        { value: 'google', label: 'Google API Call' },
      ]
    }
  ],
  ja: [
    {
      value: 'gummy',
      label: 'クラウド - アリババクラウド - Gummy',
      languages: [
        { value: 'auto', label: '自動検出' },
        { value: 'en', label: '英語' },
        { value: 'zh', label: '中国語' },
        { value: 'ja', label: '日本語' },
        { value: 'ko', label: '韓国語' },
        { value: 'de', label: 'ドイツ語' },
        { value: 'fr', label: 'フランス語' },
        { value: 'ru', label: 'ロシア語' },
        { value: 'es', label: 'スペイン語' },
        { value: 'it', label: 'イタリア語' },
      ]
    },
    {
      value: 'vosk',
      label: 'ローカル - Vosk',
      languages: [
        { value: 'auto', label: 'モデルを手動で設定する必要があります' },
        { value: 'en', label: '英語' },
        { value: 'zh-cn', label: '中国語' },
        { value: 'ja', label: '日本語' },
        { value: 'ko', label: '韓国語' },
        { value: 'de', label: 'ドイツ語' },
        { value: 'fr', label: 'フランス語' },
        { value: 'ru', label: 'ロシア語' },
        { value: 'es', label: 'スペイン語' },
        { value: 'it', label: 'イタリア語' },
      ],
      transModel: [
        { value: 'ollama', label: 'Ollama ローカルモデル' },
        { value: 'google', label: 'Google API 呼び出し' },
      ]
    }
  ]
}
