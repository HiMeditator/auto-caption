import './assets/styles/reset.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

const app = createApp(App)
app.use(createPinia())
app.use(Antd)
app.mount('#app')