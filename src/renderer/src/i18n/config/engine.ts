// type: -1 仅为源语言，0 两者皆可， 1 仅为翻译语言
export const engines = {
  zh: [
    {
      value: 'gummy',
      label: '云端 / 阿里云 / Gummy',
      languages: [
        { value: 'auto', type: -1, label: '自动检测' },
        { value: 'en', type: 0, label: '英语' },
        { value: 'zh', type: 0, label: '中文' },
        { value: 'ja', type: 0, label: '日语' },
        { value: 'ko', type: 0, label: '韩语' },
        { value: 'de', type: -1, label: '德语' },
        { value: 'fr', type: -1, label: '法语' },
        { value: 'ru', type: -1, label: '俄语' },
        { value: 'es', type: -1, label: '西班牙语' },
        { value: 'it', type: -1, label: '意大利语' },
        { value: 'yue', type: -1, label: '粤语' },
      ]
    },
    {
      value: 'vosk',
      label: '本地 / Vosk',
      languages: [
        { value: 'auto', type: -1, label: '需要自行配置模型' },
        { value: 'en', type: 1, label: '英语' },
        { value: 'zh-cn', type: 1, label: '中文' },
        { value: 'ja', type: 1, label: '日语' },
        { value: 'ko', type: 1, label: '韩语' },
        { value: 'de', type: 1, label: '德语' },
        { value: 'fr', type: 1, label: '法语' },
        { value: 'ru', type: 1, label: '俄语' },
        { value: 'es', type: 1, label: '西班牙语' },
        { value: 'it', type: 1, label: '意大利语' },
      ],
      transModel: [
        { value: 'ollama', label: 'Ollama 本地模型' },
        { value: 'google', label: 'Google API 调用' },
      ]
    },
    {
      value: 'sosv',
      label: '本地 / SOSV',
      languages: [
        { value: 'auto', type: -1, label: '自动检测' },
        { value: 'en', type: 0, label: '英语' },
        { value: 'zh', type: 0, label: '中文' },
        { value: 'ja', type: 0, label: '日语' },
        { value: 'ko', type: 0, label: '韩语' },
        { value: 'yue', type: -1, label: '粤语' },
        { value: 'de', type: 1, label: '德语' },
        { value: 'fr', type: 1, label: '法语' },
        { value: 'ru', type: 1, label: '俄语' },
        { value: 'es', type: 1, label: '西班牙语' },
        { value: 'it', type: 1, label: '意大利语' },
      ],
      transModel: [
        { value: 'ollama', label: 'Ollama 本地模型' },
        { value: 'google', label: 'Google API 调用' },
      ]
    },
    {
      value: 'glm',
      label: '云端 / 智谱AI / GLM-ASR',
      languages: [
        { value: 'auto', type: -1, label: '自动检测' },
        { value: 'en', type: 0, label: '英语' },
        { value: 'zh', type: 0, label: '中文' },
        { value: 'ja', type: 0, label: '日语' },
        { value: 'ko', type: 0, label: '韩语' },
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
      label: 'Cloud / Alibaba Cloud / Gummy',
      languages: [
        { value: 'auto', type: -1, label: 'Auto Detect' },
        { value: 'en', type: 0, label: 'English' },
        { value: 'zh', type: 0, label: 'Chinese' },
        { value: 'ja', type: 0, label: 'Japanese' },
        { value: 'ko', type: 0, label: 'Korean' },
        { value: 'de', type: -1, label: 'German' },
        { value: 'fr', type: -1, label: 'French' },
        { value: 'ru', type: -1, label: 'Russian' },
        { value: 'es', type: -1, label: 'Spanish' },
        { value: 'it', type: -1, label: 'Italian' },
        { value: 'yue', type: -1, label: 'Cantonese' },
      ]
    },
    {
      value: 'vosk',
      label: 'Local / Vosk',
      languages: [
        { value: 'auto', type: -1, label: 'Model needs to be configured manually' },
        { value: 'en', type: 1, label: 'English' },
        { value: 'zh-cn', type: 1, label: 'Chinese' },
        { value: 'ja', type: 1, label: 'Japanese' },
        { value: 'ko', type: 1, label: 'Korean' },
        { value: 'de', type: 1, label: 'German' },
        { value: 'fr', type: 1, label: 'French' },
        { value: 'ru', type: 1, label: 'Russian' },
        { value: 'es', type: 1, label: 'Spanish' },
        { value: 'it', type: 1, label: 'Italian' },
      ],
      transModel: [
        { value: 'ollama', label: 'Ollama Local Model' },
        { value: 'google', label: 'Google API Call' },
      ]
    },
    {
      value: 'sosv',
      label: 'Local / SOSV',
      languages: [
        { value: 'auto', type: -1, label: 'Auto Detect' },
        { value: 'en', type: 0, label: 'English' },
        { value: 'zh-cn', type: 0, label: 'Chinese' },
        { value: 'ja', type: 0, label: 'Japanese' },
        { value: 'ko', type: 0, label: 'Korean' },
        { value: 'yue', type: -1, label: 'Cantonese' },
        { value: 'de', type: 1, label: 'German' },
        { value: 'fr', type: 1, label: 'French' },
        { value: 'ru', type: 1, label: 'Russian' },
        { value: 'es', type: 1, label: 'Spanish' },
        { value: 'it', type: 1, label: 'Italian' },
      ],
      transModel: [
        { value: 'ollama', label: 'Ollama Local Model' },
        { value: 'google', label: 'Google API Call' },
      ]
    },
    {
      value: 'glm',
      label: 'Cloud / Zhipu AI / GLM-ASR',
      languages: [
        { value: 'auto', type: -1, label: 'Auto Detect' },
        { value: 'en', type: 0, label: 'English' },
        { value: 'zh', type: 0, label: 'Chinese' },
        { value: 'ja', type: 0, label: 'Japanese' },
        { value: 'ko', type: 0, label: 'Korean' },
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
      label: 'クラウド / アリババクラウド / Gummy',
      languages: [
        { value: 'auto', type: -1, label: '自動検出' },
        { value: 'en', type: 0, label: '英語' },
        { value: 'zh', type: 0, label: '中国語' },
        { value: 'ja', type: 0, label: '日本語' },
        { value: 'ko', type: 0, label: '韓国語' },
        { value: 'de', type: -1, label: 'ドイツ語' },
        { value: 'fr', type: -1, label: 'フランス語' },
        { value: 'ru', type: -1, label: 'ロシア語' },
        { value: 'es', type: -1, label: 'スペイン語' },
        { value: 'it', type: -1, label: 'イタリア語' },
        { value: 'yue', type: -1, label: '広東語' },
      ]
    },
    {
      value: 'vosk',
      label: 'ローカル / Vosk',
      languages: [
        { value: 'auto', type: -1, label: 'モデルを手動で設定する必要があります' },
        { value: 'en', type: 1, label: '英語' },
        { value: 'zh-cn', type: 1, label: '中国語' },
        { value: 'ja', type: 1, label: '日本語' },
        { value: 'ko', type: 1, label: '韓国語' },
        { value: 'de', type: 1, label: 'ドイツ語' },
        { value: 'fr', type: 1, label: 'フランス語' },
        { value: 'ru', type: 1, label: 'ロシア語' },
        { value: 'es', type: 1, label: 'スペイン語' },
        { value: 'it', type: 1, label: 'イタリア語' },
      ],
      transModel: [
        { value: 'ollama', label: 'Ollama ローカルモデル' },
        { value: 'google', label: 'Google API 呼び出し' },
      ]
    },
    {
      value: 'sosv',
      label: 'ローカル / SOSV',
      languages: [
        { value: 'auto', type: -1, label: '自動検出' },
        { value: 'en', type: 0, label: '英語' },
        { value: 'zh-cn', type: 0, label: '中国語' },
        { value: 'ja', type: 0, label: '日本語' },
        { value: 'ko', type: 0, label: '韓国語' },
        { value: 'yue', type: -1, label: '広東語' },
        { value: 'de', type: 1, label: 'ドイツ語' },
        { value: 'fr', type: 1, label: 'フランス語' },
        { value: 'ru', type: 1, label: 'ロシア語' },
        { value: 'es', type: 1, label: 'スペイン語' },
        { value: 'it', type: 1, label: 'イタリア語' },
      ],
      transModel: [
        { value: 'ollama', label: 'Ollama ローカルモデル' },
        { value: 'google', label: 'Google API 呼び出し' },
      ]
    },
    {
      value: 'glm',
      label: 'クラウド / 智譜AI / GLM-ASR',
      languages: [
        { value: 'auto', type: -1, label: '自動検出' },
        { value: 'en', type: 0, label: '英語' },
        { value: 'zh', type: 0, label: '中国語' },
        { value: 'ja', type: 0, label: '日本語' },
        { value: 'ko', type: 0, label: '韓国語' },
      ],
      transModel: [
        { value: 'ollama', label: 'Ollama ローカルモデル' },
        { value: 'google', label: 'Google API 呼び出し' },
      ]
    }
  ]
}
