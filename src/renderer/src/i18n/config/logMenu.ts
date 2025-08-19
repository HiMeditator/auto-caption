import { h } from 'vue';
import { OrderedListOutlined, FileTextOutlined } from '@ant-design/icons-vue'

export const logMenu = {
  zh: [
    {
      key: 'captionLog',
      icon: () => h(OrderedListOutlined),
      label: '字幕记录',
    },
    {
      key: 'projLog',
      icon: () => h(FileTextOutlined),
      label: '日志记录',
    },
  ],
  en: [
    {
      key: 'captionLog',
      icon: () => h(OrderedListOutlined),
      label: 'Caption Log',
    },
    {
      key: 'projLog',
      icon: () => h(FileTextOutlined),
      label: 'Software Log',
    },
  ],
  ja: [
    {
      key: 'captionLog',
      icon: () => h(OrderedListOutlined),
      label: '字幕記録',
    },
    {
      key: 'projLog',
      icon: () => h(FileTextOutlined),
      label: 'ログ記録',
    },
  ]
}