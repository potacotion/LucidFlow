// main.js / main.ts
import '@fortawesome/fontawesome-free/css/all.css'
import '@/styles/index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { OpenAPI } from '@/api'
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zhCN from './locales/zh-CN.json'

import App from './App.vue'
import router from './router'
import Toast, { type PluginOptions } from "vue-toastification";
import "vue-toastification/dist/index.css";
import { setupTooltipDirective } from '@/directives/tooltip'

OpenAPI.BASE = 'http://localhost:3000';

const app = createApp(App)

const options: PluginOptions = {
    // You can set your default options here
};

const i18n = createI18n({
  legacy: false, // a composition API
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    en,
    'zh-CN': zhCN,
  },
})

app.use(createPinia())
app.use(router)
app.use(Toast, options);
app.use(i18n)
setupTooltipDirective(app)

app.mount('#app')
