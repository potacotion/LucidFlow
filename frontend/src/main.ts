// main.js / main.ts
import '@fortawesome/fontawesome-free/css/all.css'
import '@/assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { OpenAPI } from '@/api'

import App from './App.vue'
import router from './router'

OpenAPI.BASE = 'http://localhost:3000';

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
